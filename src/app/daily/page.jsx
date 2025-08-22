"use client";
import styles from "./page.module.css";
import { useState, useEffect, useRef } from "react";
import { getDailySong } from "@/lib/api";
import { useDailySong } from "@/context/DailySongContext";

const Daily = () => {
  const [dailySong, setDailySong] = useState(null);
  const [instruments, setInstruments] = useState([]);
  const [currentInstrument, setCurrentInstrument] = useState(null);
  const [disabledInstruments, setDisabledInstruments] = useState([]);
  const audioRef = useRef(null);
  const currentInstrumentRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [revealHint, setRevealHint] = useState(false);
  const [skipDisabled, setSkipDisabled] = useState(false);

  useEffect(() => {
    const fetchDailySong = async () => {
      try {
        const song = await getDailySong();
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
    return <div>Loading...</div>;
  }

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
          <div className={styles.audioPlayerContainer}>
            <audio
              ref={audioRef}
              src={currentInstrument?.audioUrl}
              style={{ display: "none" }}
            />
          </div>
          <div className={styles.controls}>
            <button className={styles.button}>Guess</button>
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
    </div>
  );
};

export default Daily;
