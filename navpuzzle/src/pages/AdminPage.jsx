import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import { getAllPlayers, getAllSessions, getAllFeedback, clearAllData, exportJSON } from "../data/storage";
import { playClick, playWin } from "../data/sounds";
import styles from "./AdminPage.module.css";

const ADMIN_PASSWORD = "navpuzzle2025"; // Change as needed

const TABS = ["Overview", "Players", "Sessions", "Feedback"];
const EMOJIS = ["😡", "😞", "😐", "😊", "🤩"];

export default function AdminPage() {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [pwError, setPwError] = useState("");
  const [tab, setTab] = useState("Overview");
  const [players, setPlayers] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    if (authed) {
      setPlayers(getAllPlayers());
      setSessions(getAllSessions());
      setFeedback(getAllFeedback());
    }
  }, [authed]);

  function handleLogin(e) {
    e.preventDefault();
    if (pw === ADMIN_PASSWORD) {
      playWin();
      setAuthed(true);
    } else {
      setPwError("❌ Incorrect password!");
      setPw("");
    }
  }

  function handleClear() {
    if (!window.confirm("Clear ALL game data? This cannot be undone.")) return;
    clearAllData();
    setPlayers([]); setSessions([]); setFeedback([]);
    setCleared(true);
    setTimeout(() => setCleared(false), 3000);
  }

  function handleExport() {
    const json = exportJSON();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `navpuzzle_data_${Date.now()}.json`;
    a.click(); URL.revokeObjectURL(url);
  }

  function fmtDate(iso) {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) +
      " " + d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  }

  function fmtDuration(s) {
    if (!s && s !== 0) return "—";
    return s >= 60 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${s}s`;
  }

  const avgRating = feedback.length
    ? (feedback.reduce((a, f) => a + f.rating, 0) / feedback.length).toFixed(1)
    : "—";

  const totalWins = sessions.filter(s => s.won).length;
  const totalLosses = sessions.filter(s => !s.won).length;
  const winRate = sessions.length ? Math.round((totalWins / sessions.length) * 100) : 0;

  // ── Login Screen ────────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div className={styles.page}>
        <NavBar />
        <div className={styles.center}>
          <form className={`glass-card ${styles.loginCard}`} onSubmit={handleLogin}>
            <div className={styles.lockIcon}>🔐</div>
            <h2 className={styles.loginTitle}>Admin Access</h2>
            <p className={styles.loginSub}>NavPuzzle Dashboard — Authorized Personnel Only</p>
            <input
              className="neon-input"
              type="password"
              placeholder="Enter admin password..."
              value={pw}
              onChange={e => { setPw(e.target.value); setPwError(""); }}
              autoFocus
            />
            {pwError && <p className={styles.error}>{pwError}</p>}
            <div className={styles.loginBtns}>
              <button type="submit" className="btn-neon green"><span>🔓 Login</span></button>
              <button type="button" className="btn-neon" onClick={() => { playClick(); navigate("/"); }}>
                <span>← Back</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ── Admin Dashboard ─────────────────────────────────────────────────────────
  return (
    <div className={styles.page}>
      <NavBar />
      <div className={styles.dashboard}>

        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.dashTitle}>Admin Dashboard</h1>
            <p className={styles.dashSub}>NavPuzzle — Game Analytics & Management</p>
          </div>
          <div className={styles.headerBtns}>
            <button className="btn-neon" onClick={handleExport}><span>⬇ Export</span></button>
            <button className="btn-neon pink" onClick={handleClear}><span>🗑 Clear</span></button>
            <button className="btn-neon" onClick={() => { playClick(); navigate("/"); }}>
              <span>← Home</span>
            </button>
          </div>
        </div>

        {cleared && <div className={styles.toast}>✅ All data cleared!</div>}

        {/* Tab bar */}
        <div className={styles.tabs}>
          {TABS.map(t => (
            <button
              key={t}
              className={`${styles.tabBtn} ${tab === t ? styles.tabActive : ""}`}
              onClick={() => { setTab(t); playClick(); }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* ── Overview Tab ────────────────────────────────────────────────── */}
        {tab === "Overview" && (
          <div className={styles.tabContent}>
            <div className={styles.statGrid}>
              <StatCard label="Total Players" value={players.length} color="var(--neon-cyan)" icon="👥" />
              <StatCard label="Total Sessions" value={sessions.length} color="var(--neon-purple)" icon="🎮" />
              <StatCard label="Total Wins" value={totalWins} color="var(--neon-green)" icon="🏆" />
              <StatCard label="Win Rate" value={`${winRate}%`} color="var(--neon-yellow)" icon="📊" />
              <StatCard label="Total Feedback" value={feedback.length} color="var(--neon-pink)" icon="💬" />
              <StatCard label="Avg Rating" value={avgRating} color="var(--neon-orange)" icon="⭐" />
            </div>

            <div className={styles.overviewGrid}>
              {/* Top players */}
              <div className={`glass-card ${styles.overviewCard}`}>
                <h3 className={styles.overviewCardTitle}>🏅 Top Players</h3>
                {players.length === 0 ? (
                  <p className={styles.empty}>No players yet.</p>
                ) : (
                  <table className="neon-table">
                    <thead>
                      <tr><th>#</th><th>Name</th><th>Played</th><th>Wins</th><th>Best Level</th></tr>
                    </thead>
                    <tbody>
                      {[...players].sort((a, b) => b.totalWins - a.totalWins).slice(0, 5).map((p, i) => (
                        <tr key={p.name}>
                          <td style={{ color: i === 0 ? "#ffd600" : i === 1 ? "#aaa" : "#cd7f32" }}>
                            {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                          </td>
                          <td style={{ color: "var(--neon-cyan)", fontWeight: 700 }}>{p.name}</td>
                          <td>{p.timesPlayed}</td>
                          <td style={{ color: "var(--neon-green)" }}>{p.totalWins || 0}</td>
                          <td>Lv.{p.bestLevel || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Recent feedback */}
              <div className={`glass-card ${styles.overviewCard}`}>
                <h3 className={styles.overviewCardTitle}>💬 Recent Feedback</h3>
                {feedback.length === 0 ? (
                  <p className={styles.empty}>No feedback yet.</p>
                ) : (
                  <div className={styles.feedbackList}>
                    {[...feedback].reverse().slice(0, 4).map(f => (
                      <div key={f.id} className={styles.feedItem}>
                        <div className={styles.feedHeader}>
                          <span className={styles.feedName}>{f.playerName}</span>
                          <span className={styles.feedEmoji}>{EMOJIS[f.rating - 1]}</span>
                        </div>
                        {f.comment && <p className={styles.feedComment}>{f.comment}</p>}
                        <span className={styles.feedDate}>{fmtDate(f.date)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Players Tab ─────────────────────────────────────────────────── */}
        {tab === "Players" && (
          <div className={styles.tabContent}>
            <div className={`glass-card ${styles.tableCard}`}>
              <div className={styles.tableHeader}>
                <h3 className={styles.tableTitle}>All Players ({players.length})</h3>
              </div>
              {players.length === 0 ? (
                <p className={styles.empty}>No players yet. Be the first!</p>
              ) : (
                <div className={styles.tableWrap}>
                  <table className="neon-table">
                    <thead>
                      <tr>
                        <th>#</th><th>Name</th><th>Times Played</th>
                        <th>Wins</th><th>Best Level</th><th>First Seen</th><th>Last Played</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...players].sort((a, b) => b.timesPlayed - a.timesPlayed).map((p, i) => (
                        <tr key={p.name}>
                          <td style={{ color: "var(--text-muted)" }}>{i + 1}</td>
                          <td style={{ color: "var(--neon-cyan)", fontWeight: 700 }}>{p.name}</td>
                          <td>{p.timesPlayed}</td>
                          <td style={{ color: "var(--neon-green)" }}>{p.totalWins || 0}</td>
                          <td style={{ color: "var(--neon-yellow)" }}>Level {p.bestLevel || 0}</td>
                          <td style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>{fmtDate(p.firstSeen)}</td>
                          <td style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>{fmtDate(p.lastPlayed)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Sessions Tab ────────────────────────────────────────────────── */}
        {tab === "Sessions" && (
          <div className={styles.tabContent}>
            <div className={`glass-card ${styles.tableCard}`}>
              <div className={styles.tableHeader}>
                <h3 className={styles.tableTitle}>All Game Sessions ({sessions.length})</h3>
                <div className={styles.sessionStats}>
                  <span style={{ color: "var(--neon-green)" }}>✅ {totalWins} Wins</span>
                  <span style={{ color: "#ff4b6e" }}>❌ {totalLosses} Losses</span>
                </div>
              </div>
              {sessions.length === 0 ? (
                <p className={styles.empty}>No sessions yet.</p>
              ) : (
                <div className={styles.tableWrap}>
                  <table className="neon-table">
                    <thead>
                      <tr>
                        <th>#</th><th>Player</th><th>Level</th><th>Result</th>
                        <th>Moves</th><th>Time Taken</th><th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...sessions].reverse().map((s, i) => (
                        <tr key={s.id}>
                          <td style={{ color: "var(--text-muted)" }}>{sessions.length - i}</td>
                          <td style={{ color: "var(--neon-cyan)", fontWeight: 700 }}>{s.name}</td>
                          <td style={{ color: "var(--neon-yellow)" }}>Lv.{s.level}</td>
                          <td>
                            <span className={s.won ? "badge badge-win" : "badge badge-lose"}>
                              {s.won ? "WIN" : "LOSE"}
                            </span>
                          </td>
                          <td>{s.moves}</td>
                          <td>{fmtDuration(s.timeTaken)}</td>
                          <td style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{fmtDate(s.date)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Feedback Tab ────────────────────────────────────────────────── */}
        {tab === "Feedback" && (
          <div className={styles.tabContent}>
            <div className={styles.feedbackStats}>
              {[1, 2, 3, 4, 5].map(r => {
                const count = feedback.filter(f => f.rating === r).length;
                const pct = feedback.length ? (count / feedback.length) * 100 : 0;
                return (
                  <div key={r} className={styles.feedStatRow}>
                    <span className={styles.feedStatEmoji}>{EMOJIS[r - 1]}</span>
                    <div className="progress-bar-wrap" style={{ flex: 1 }}>
                      <div className="progress-bar-fill" style={{
                        width: `${pct}%`,
                        background: `linear-gradient(90deg, var(--neon-${r < 3 ? "pink" : r < 5 ? "yellow" : "green"}), transparent)`
                      }} />
                    </div>
                    <span className={styles.feedStatCount}>{count}</span>
                  </div>
                );
              })}
            </div>

            <div className={styles.feedGrid}>
              {feedback.length === 0 ? (
                <p className={styles.empty}>No feedback yet.</p>
              ) : (
                [...feedback].reverse().map(f => (
                  <div key={f.id} className={`glass-card ${styles.feedCard}`}>
                    <div className={styles.feedCardTop}>
                      <span className={styles.feedCardName}>{f.playerName}</span>
                      <span className={styles.feedCardEmoji}>{EMOJIS[f.rating - 1]}</span>
                    </div>
                    <div className={styles.feedCardRating}>
                      {"⭐".repeat(f.rating)}{"☆".repeat(5 - f.rating)}
                    </div>
                    {f.comment && <p className={styles.feedCardComment}>"{f.comment}"</p>}
                    <span className={styles.feedCardDate}>{fmtDate(f.date)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color, icon }) {
  return (
    <div className={`glass-card ${styles.statCard}`}>
      <span className={styles.statIcon}>{icon}</span>
      <span className={styles.statValue} style={{ color, textShadow: `0 0 10px ${color}` }}>
        {value}
      </span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  );
}
