"use client";
import styles from "./page.module.css";
import { useState, useEffect, useRef } from "react";
import { getDailySong, getSongById } from "@/lib/api";
import { useRouter, useParams } from "next/navigation";
import GuessSongModal from "@/components/modal/GuessSongModal.jsx";
import LoadingSpinner from "@/components/LoadingSpinner/LoadingSpinner";

const Daily = () => {
  const [dailySong, setDailySong] = useState(null);
  const [instruments, setInstruments] = useState([]);
  const [currentInstrument, setCurrentInstrument] = useState(null);
  const [disabledInstruments, setDisabledInstruments] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [revealHint, setRevealHint] = useState(false);
  const [skipDisabled, setSkipDisabled] = useState(false);
  const [isGuessModalOpen, setIsGuessModalOpen] = useState(false);

  const router = useRouter();
  const { songId } = useParams();

  const audioRef = useRef(null);
  const currentInstrumentRef = useRef(null);

  useEffect(() => {
    const fetchDailySong = async () => {
      try {
        const song = await getSongById(songId);
        setDailySong(song);
        const fetchedInstruments = song.instruments.map((inst) => ({
          name: inst.name,
          image: inst.image,
          audioUrl: inst.audioUrl,
        }));
        setInstruments(fetchedInstruments);
        setCurrentInstrument(fetchedInstruments[0]);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch daily song:", error);
        setLoading(false);
      }
    };

    fetchDailySong();
  }, []);

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

  if (loading) {
    return <LoadingSpinner />;
  }

  const handleConfirmSong = (selectedSong) => {
    const [artist, title] = selectedSong.split(" - ");

    if (
      artist.trim().toLowerCase() === dailySong.artist.trim().toLowerCase() &&
      title.trim().toLowerCase() === dailySong.title.trim().toLowerCase()
    ) {
      alert("Rétt!");
    } else {
      if (skipDisabled) {
        if (revealHint) {
          alert(
            "Lag dagsins var: " + dailySong.title + " - " + dailySong.artist
          );
        } else {
          setRevealHint(true);
        }
      } else {
        skipInstrument();
      }
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Lag dagsins</h1>
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
          {revealHint && <button className={styles.button}>Gefast upp</button>}
          <div className={styles.audioPlayerContainer}>
            <audio
              ref={audioRef}
              src={currentInstrument?.audioUrl}
              style={{ display: "none" }}
            />
          </div>
          <div className={styles.controls}>
            <button
              className={styles.button}
              onClick={() => setIsGuessModalOpen(true)}
            >
              Guess
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
              Skip
            </button>
          </div>
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
    </div>
  );
};

export default Daily;
