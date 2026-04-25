// GitHub-based storage for NavPuzzle
// Uses GitHub Gist as a simple key-value store (frontend only)

const STORAGE_KEY_PLAYERS = "navpuzzle_players";
const STORAGE_KEY_FEEDBACK = "navpuzzle_feedback";
const STORAGE_KEY_SESSIONS = "navpuzzle_sessions";

// ── LocalStorage helpers (fallback / primary for now) ──────────────────────
function readLS(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function writeLS(key, data) {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch {}
}

// ── Player session ──────────────────────────────────────────────────────────
export function savePlayerSession(session) {
  // session: { id, name, level, score, moves, timeTaken, won, date }
  const sessions = readLS(STORAGE_KEY_SESSIONS);
  sessions.push({ ...session, id: Date.now(), date: new Date().toISOString() });
  writeLS(STORAGE_KEY_SESSIONS, sessions);

  // Update player profile
  const players = readLS(STORAGE_KEY_PLAYERS);
  const idx = players.findIndex(p => p.name.toLowerCase() === session.name.toLowerCase());
  if (idx >= 0) {
    players[idx].timesPlayed = (players[idx].timesPlayed || 0) + 1;
    players[idx].bestLevel = Math.max(players[idx].bestLevel || 0, session.won ? session.level : 0);
    players[idx].lastPlayed = new Date().toISOString();
    players[idx].totalWins = (players[idx].totalWins || 0) + (session.won ? 1 : 0);
  } else {
    players.push({
      name: session.name,
      firstSeen: new Date().toISOString(),
      lastPlayed: new Date().toISOString(),
      timesPlayed: 1,
      bestLevel: session.won ? session.level : 0,
      totalWins: session.won ? 1 : 0,
    });
  }
  writeLS(STORAGE_KEY_PLAYERS, players);
}

export function saveFeedback(feedback) {
  // feedback: { playerName, rating, comment, date }
  const list = readLS(STORAGE_KEY_FEEDBACK);
  list.push({ ...feedback, id: Date.now(), date: new Date().toISOString() });
  writeLS(STORAGE_KEY_FEEDBACK, list);
}

export function getAllPlayers() { return readLS(STORAGE_KEY_PLAYERS); }
export function getAllSessions() { return readLS(STORAGE_KEY_SESSIONS); }
export function getAllFeedback() { return readLS(STORAGE_KEY_FEEDBACK); }

export function clearAllData() {
  localStorage.removeItem(STORAGE_KEY_PLAYERS);
  localStorage.removeItem(STORAGE_KEY_FEEDBACK);
  localStorage.removeItem(STORAGE_KEY_SESSIONS);
}

export function exportJSON() {
  return JSON.stringify({
    players: getAllPlayers(),
    sessions: getAllSessions(),
    feedback: getAllFeedback(),
    exportedAt: new Date().toISOString(),
  }, null, 2);
}
