"use client";
import { useMemo } from "react";
import { loadStats, getWinPercentage, getMaxDistribution } from "@/lib/stats";
import styles from "./GameEndStats.module.css";

const GameEndStats = ({ isOpen, onClose, gameResult }) => {
  const stats = useMemo(() => loadStats(), [isOpen]);
  const winPercentage = useMemo(() => getWinPercentage(stats), [stats]);
  const maxDistribution = useMemo(() => getMaxDistribution(stats), [stats]);

  if (!isOpen) return null;

  const { won, guessNumber, songTitle, songArtist, isPractice } = gameResult || {};

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

        <button onClick={onClose} className={styles.button}>
          Loka
        </button>
      </div>
    </div>
  );
};

export default GameEndStats;
