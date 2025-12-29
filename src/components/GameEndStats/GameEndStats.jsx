"use client";
import { useMemo, useState, useEffect } from "react";
import { loadStats, getWinPercentage, getMaxDistribution } from "@/lib/stats";
import { getSongStats } from "@/lib/api";
import styles from "./GameEndStats.module.css";

const GameEndStats = ({ isOpen, onClose, gameResult }) => {
  const stats = useMemo(() => loadStats(), [isOpen]);
  const winPercentage = useMemo(() => getWinPercentage(stats), [stats]);
  const maxDistribution = useMemo(() => getMaxDistribution(stats), [stats]);

  const [songStats, setSongStats] = useState(null);
  const [loadingSongStats, setLoadingSongStats] = useState(false);

  const { won, guessNumber, songTitle, songArtist, songId, isPractice } =
    gameResult || {};

  useEffect(() => {
    if (isOpen && songId && !isPractice) {
      setLoadingSongStats(true);
      getSongStats(songId).then((data) => {
        setSongStats(data);
        setLoadingSongStats(false);
      });
    }
  }, [isOpen, songId, isPractice]);

  if (!isOpen) return null;

  const getSongStatsMaxDistribution = () => {
    if (!songStats?.distribution) return 1;
    return Math.max(...Object.values(songStats.distribution), 1);
  };

  const getPercentageForGuess = (guess) => {
    if (!songStats || songStats.totalWins === 0) return 0;
    const count = songStats.distribution?.[guess] || 0;
    return Math.round((count / songStats.totalWins) * 100);
  };

  const songStatsMaxDist = getSongStatsMaxDistribution();

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button onClick={onClose} className={styles.closeButton}>
          ✕
        </button>

        {isPractice && (
          <p className={styles.practiceLabel}>Æfing - telst ekki</p>
        )}

        <h2 className={styles.title}>
          {won ? "Til hamingju!" : "Betra luck næst!"}
        </h2>

        {songTitle && songArtist && (
          <p className={styles.songReveal}>
            {won ? "Þú giskaðir rétt á:" : "Lagið var:"}
            <br />
            <strong>
              {songArtist} - {songTitle}
            </strong>
          </p>
        )}

        {won && (
          <p className={styles.guessInfo}>
            Þú fannst lagið í{" "}
            <strong>
              {guessNumber} {guessNumber === 1 ? "tilraun" : "tilraunum"}
            </strong>
          </p>
        )}

        <div className={styles.statsGrid}>
          <div className={styles.statBox}>
            <span className={styles.statNumber}>{stats.gamesPlayed}</span>
            <span className={styles.statLabel}>Leikir</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statNumber}>{winPercentage}%</span>
            <span className={styles.statLabel}>Sigrar</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statNumber}>{stats.currentStreak}</span>
            <span className={styles.statLabel}>Núverandi streak</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statNumber}>{stats.maxStreak}</span>
            <span className={styles.statLabel}>Besta streak</span>
          </div>
        </div>

        <div className={styles.distributionSection}>
          <h3>Dreifing</h3>
          <div className={styles.distribution}>
            {Object.entries(stats.guessDistribution).map(([guess, count]) => (
              <div key={guess} className={styles.distributionRow}>
                <span className={styles.guessLabel}>{guess}</span>
                <div className={styles.barContainer}>
                  <div
                    className={`${styles.bar} ${
                      won && parseInt(guess) === guessNumber
                        ? styles.barHighlight
                        : ""
                    }`}
                    style={{
                      width: `${Math.max(
                        (count / maxDistribution) * 100,
                        count > 0 ? 8 : 0
                      )}%`,
                    }}
                  >
                    <span className={styles.barCount}>{count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {!isPractice && songStats && songStats.totalPlays > 0 && (
          <div className={styles.distributionSection}>
            <h3>Overall stats ({songStats.totalPlays})</h3>
            <p className={styles.winRate}>
              {Math.round((songStats.totalWins / songStats.totalPlays) * 100)}%
              unnu
            </p>
            <div className={styles.distribution}>
              {[1, 2, 3, 4, 5, 6, 7].map((guess) => {
                const count = songStats.distribution?.[guess] || 0;
                const percentage = getPercentageForGuess(guess);
                return (
                  <div key={guess} className={styles.distributionRow}>
                    <span className={styles.guessLabel}>{guess}</span>
                    <div className={styles.barContainer}>
                      <div
                        className={`${styles.bar} ${styles.barOthers} ${
                          won && guess === guessNumber
                            ? styles.barHighlight
                            : ""
                        }`}
                        style={{
                          width: `${Math.max(
                            (count / songStatsMaxDist) * 100,
                            count > 0 ? 8 : 0
                          )}%`,
                        }}
                      >
                        <span className={styles.barCount}>{percentage}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {loadingSongStats && (
          <p className={styles.loadingText}>Sæki tölfræði...</p>
        )}

        <button onClick={onClose} className={styles.button}>
          Loka
        </button>
      </div>
    </div>
  );
};

export default GameEndStats;
