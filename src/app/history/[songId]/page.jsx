"use client";
import styles from "./page.module.css";
import { useState, useEffect, useRef } from "react";
import { getSongById } from "@/lib/api";
import { useParams } from "next/navigation";
import { recordGame, hasCompletedGame, getCompletedGame } from "@/lib/stats";
import GuessSongModal from "@/components/modal/GuessSongModal.jsx";
import GameEndStats from "@/components/GameEndStats/GameEndStats";
import LoadingSpinner from "@/components/LoadingSpinner/LoadingSpinner";

const HistorySong = () => {
  const [dailySong, setDailySong] = useState(null);
  const [instruments, setInstruments] = useState([]);
  const [currentInstrument, setCurrentInstrument] = useState(null);
  const [disabledInstruments, setDisabledInstruments] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [revealHint, setRevealHint] = useState(false);
  const [skipDisabled, setSkipDisabled] = useState(false);
  const [isGuessModalOpen, setIsGuessModalOpen] = useState(false);
  const [gameEnd, setGameEnd] = useState(false);

  const [guessCount, setGuessCount] = useState(0);
  const [showStats, setShowStats] = useState(false);
  const [gameResult, setGameResult] = useState(null);
  const [alreadyPlayed, setAlreadyPlayed] = useState(false);
  const [isPracticeMode, setIsPracticeMode] = useState(false);

  const { songId } = useParams();

  const audioRef = useRef(null);
  const currentInstrumentRef = useRef(null);

  useEffect(() => {
    const fetchSong = async () => {
      try {
        const song = await getSongById(songId);
        setDailySong(song);

        if (hasCompletedGame(songId)) {
          const previousResult = getCompletedGame(songId);
          setAlreadyPlayed(true);
          setGameEnd(true);
          setGameResult({
            won: previousResult.won,
            guessNumber: previousResult.guessNumber,
            songTitle: song.title,
            songArtist: song.artist,
          });
          setShowStats(true);
        }

        const fetchedInstruments = song.instruments.map((inst) => ({
          name: inst.name,
          image: inst.image,
          audioUrl: inst.audioUrl,
        }));
        setInstruments(fetchedInstruments);
        setCurrentInstrument(fetchedInstruments[0]);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch song:", error);
        setLoading(false);
      }
    };

    fetchSong();
  }, [songId]);

  function numberWithCommas(x) {
    if (x === undefined || x === null || x === "") return "";
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  function skipInstrument() {
    const currentIndex = instruments.indexOf(currentInstrument);
    const nextIndex = currentIndex + 1;
    if (instruments[nextIndex]) {
      setDisabledInstruments([...disabledInstruments, currentInstrument]);
      setCurrentInstrument(instruments[nextIndex]);
      setIsPlaying(false);
      if (audioRef.current) audioRef.current.pause();
    } else {
      audioRef.current.pause();
      setDisabledInstruments([...disabledInstruments, currentInstrument]);
      setCurrentInstrument(null);
      setSkipDisabled(true);
      setRevealHint(true);
    }
  }

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      currentInstrumentRef.current = currentInstrument;
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    if (!audioRef.current) return;
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    audioRef.current.addEventListener("play", onPlay);
    audioRef.current.addEventListener("pause", onPause);
    return () => {
      if (audioRef?.current) {
        audioRef.current.removeEventListener("play", onPlay);
        audioRef.current.removeEventListener("pause", onPause);
      }
    };
  }, [currentInstrument]);

  const endGame = (won, finalGuessCount) => {
    if (!isPracticeMode) {
      recordGame(songId, won, finalGuessCount, {
        songTitle: dailySong.title,
        songArtist: dailySong.artist,
      });
    }

    setGameResult({
      won,
      guessNumber: finalGuessCount,
      songTitle: dailySong.title,
      songArtist: dailySong.artist,
      isPractice: isPracticeMode,
    });
    setGameEnd(true);
    setShowStats(true);
  };

  const handleConfirmSong = (selectedSong) => {
    const [artist, title] = selectedSong.split(" - ");
    const newGuessCount = guessCount + 1;
    setGuessCount(newGuessCount);

    if (
      artist.trim().toLowerCase() === dailySong.artist.trim().toLowerCase() &&
      title.trim().toLowerCase() === dailySong.title.trim().toLowerCase()
    ) {
      const instrumentsUsed = disabledInstruments.length + 1;
      const hintUsed = revealHint ? 1 : 0;
      const winRound = instrumentsUsed + hintUsed;
      endGame(true, winRound);
    } else {
      if (skipDisabled) {
        if (revealHint) {
          endGame(false, newGuessCount);
        } else {
          setRevealHint(true);
        }
      } else {
        skipInstrument();
      }
    }
  };

  const handleGiveUp = () => {
    const instrumentsUsed =
      disabledInstruments.length + (currentInstrument ? 1 : 0);
    endGame(false, instrumentsUsed);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const startPracticeMode = () => {
    setAlreadyPlayed(false);
    setIsPracticeMode(true);
    setGameEnd(false);
    setShowStats(false);
    setGuessCount(0);
    setDisabledInstruments([]);
    setCurrentInstrument(instruments[0]);
    setRevealHint(false);
    setSkipDisabled(false);
  };

  if (alreadyPlayed && !showStats) {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <h1>Eldra lag</h1>
        </header>
        <main className={styles.main}>
          <div className={styles.ctas}>
            <p style={{ textAlign: "center", fontSize: "18px" }}>
              Þú ert búinn að spila þetta lag!
            </p>
            <button
              className={styles.button}
              onClick={() => setShowStats(true)}
            >
              <img src="/img/stats.svg" alt="" className={styles.buttonIcon} />
              Sjá tölfræði
            </button>
            <button className={styles.button} onClick={startPracticeMode}>
              Spila aftur (breytir ekki stats)
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Eldra lag</h1>
      </header>
      <main className={styles.main}>
        <div className={styles.ctas}>
          <div className={styles.songInfo}>
            <div className={styles.songInfoItem}>
              <strong>Útgáfuár</strong>
              <p id="release-year">{dailySong?.releaseYear}</p>
            </div>
            <div className={styles.songInfoItem}>
              <strong>Spotify spilanir</strong>
              <p id="spotify-plays">
                ~{numberWithCommas(dailySong?.spotifyPlays)}
              </p>
            </div>
            <div className={styles.songInfoItem}>
              <strong>Erfiðleikastig</strong>
              <p id="difficulty">{dailySong?.difficulty}</p>
            </div>
          </div>
          <div className={styles.cards}>
            {instruments.map((instrument, index) => {
              let cardClass = styles.card;
              if (instrument === currentInstrument)
                cardClass += " " + styles.current;
              if (disabledInstruments.includes(instrument))
                cardClass += " " + styles.disabled;
              return (
                <div className={cardClass} key={index}>
                  <div className={styles.cardDetails}>
                    <div>
                      <strong>{instrument.name}</strong>
                    </div>
                    {instrument.image && (
                      <img
                        src={`/img/${instrument.image}`}
                        alt="preview"
                        style={{ width: 40, height: 40, objectFit: "contain" }}
                        className={styles.instrumentImage}
                      />
                    )}
                  </div>
                </div>
              );
            })}
            <div className={styles.card}>
              <div className={styles.cardDetails}>
                <strong>Vísbending</strong>
                {revealHint && <p>{dailySong?.hint}</p>}
              </div>
            </div>
          </div>
          {revealHint && !gameEnd && (
            <button className={styles.button} onClick={handleGiveUp}>
              Gefast upp
            </button>
          )}
          <div className={styles.audioPlayerContainer}>
            <audio
              ref={audioRef}
              src={currentInstrument?.audioUrl}
              style={{ display: "none" }}
            />
          </div>
          {!gameEnd && (
            <div className={styles.controls}>
              <button
                className={styles.button}
                onClick={() => setIsGuessModalOpen(true)}
              >
                Giska
              </button>
              <button
                className={styles.controlButton}
                type="button"
                onClick={handlePlayPause}
                disabled={!currentInstrument?.audioUrl}
              >
                {isPlaying ? (
                  <img src="/img/stop-button.png" alt="Pause" />
                ) : (
                  <img src="/img/play-button-arrowhead.png" alt="Play" />
                )}
              </button>
              <button
                className={styles.button}
                onClick={skipInstrument}
                disabled={skipDisabled}
              >
                Næsta hljóðfæri
              </button>
            </div>
          )}
          {gameEnd && (
            <button
              className={styles.button}
              onClick={() => setShowStats(true)}
            >
              <img src="/img/stats.svg" alt="" className={styles.buttonIcon} />
              Sjá tölfræði
            </button>
          )}
        </div>
      </main>

      {isGuessModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <GuessSongModal
              onClose={() => setIsGuessModalOpen(false)}
              onSelect={handleConfirmSong}
            />
          </div>
        </div>
      )}

      <GameEndStats
        isOpen={showStats}
        onClose={() => setShowStats(false)}
        gameResult={gameResult}
      />
    </div>
  );
};

export default HistorySong;
