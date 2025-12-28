const STATS_KEY = "songla_stats";
const GAMES_KEY = "songla_games";

function getDefaultStats() {
  return {
    gamesPlayed: 0,
    gamesWon: 0,
    currentStreak: 0,
    maxStreak: 0,
    guessDistribution: {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
      7: 0,
    },
  };
}

export function loadStats() {
  if (typeof window === "undefined") return getDefaultStats();

  try {
    const stored = localStorage.getItem(STATS_KEY);
    if (!stored) return getDefaultStats();
    return JSON.parse(stored);
  } catch (e) {
    console.error("Failed to load stats:", e);
    return getDefaultStats();
  }
}

export function saveStats(stats) {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (e) {
    console.error("Failed to save stats:", e);
  }
}

export function loadCompletedGames() {
  if (typeof window === "undefined") return {};

  try {
    const stored = localStorage.getItem(GAMES_KEY);
    if (!stored) return {};
    return JSON.parse(stored);
  } catch (e) {
    console.error("Failed to load completed games:", e);
    return {};
  }
}

function saveCompletedGames(games) {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(GAMES_KEY, JSON.stringify(games));
  } catch (e) {
    console.error("Failed to save completed games:", e);
  }
}

export function hasCompletedGame(songId) {
  const games = loadCompletedGames();
  return !!games[songId];
}

export function getCompletedGame(songId) {
  const games = loadCompletedGames();
  return games[songId] || null;
}

export function recordGame(songId, won, guessNumber, songInfo = {}) {
  if (hasCompletedGame(songId)) {
    return loadStats();
  }

  const stats = loadStats();
  const games = loadCompletedGames();

  stats.gamesPlayed += 1;

  if (won) {
    stats.gamesWon += 1;
    stats.currentStreak += 1;
    stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);

    const bucket = Math.min(guessNumber, 7);
    stats.guessDistribution[bucket] =
      (stats.guessDistribution[bucket] || 0) + 1;
  } else {
    stats.currentStreak = 0;
  }

  games[songId] = {
    won,
    guessNumber,
    date: new Date().toISOString(),
    ...songInfo,
  };

  saveStats(stats);
  saveCompletedGames(games);

  return stats;
}

export function getWinPercentage(stats) {
  if (stats.gamesPlayed === 0) return 0;
  return Math.round((stats.gamesWon / stats.gamesPlayed) * 100);
}

export function getMaxDistribution(stats) {
  return Math.max(...Object.values(stats.guessDistribution), 1);
}

export function resetStats() {
  if (typeof window === "undefined") return;

  localStorage.removeItem(STATS_KEY);
  localStorage.removeItem(GAMES_KEY);
}
