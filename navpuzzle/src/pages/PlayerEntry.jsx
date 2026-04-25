import { useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import { LEVELS } from "../data/levels";
import { playClick } from "../data/sounds";
import styles from "./PlayerEntry.module.css";

export default function PlayerEntry() {
  const [name, setName] = useState("");
  const [level, setLevel] = useState(1);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function handleStart(e) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) { setError("Please enter your name!"); return; }
    if (trimmed.length < 2) { setError("Name must be at least 2 characters."); return; }
    playClick();
    sessionStorage.setItem("np_player", trimmed);
    sessionStorage.setItem("np_level", level);
    navigate("/game");
  }

  const selectedLevel = LEVELS[level - 1];

  return (
    <div className={styles.page}>
      <NavBar />

      <div className={styles.hero}>
        <div className={styles.particles}>
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className={styles.particle} style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
              width: `${2 + Math.random() * 4}px`,
              height: `${2 + Math.random() * 4}px`,
            }} />
          ))}
        </div>

        <div className={styles.content}>
          <div className={styles.titleWrap}>
            <h1 className={styles.title}>
              <span className={styles.navText}>Nav</span>
              <span className={styles.puzzleText}>Puzzle</span>
            </h1>
            <p className={styles.subtitle}>Slide. Solve. Conquer.</p>
          </div>

          <form className={`glass-card ${styles.card}`} onSubmit={handleStart}>
            <h2 className={styles.cardTitle}>Enter the Grid</h2>

            <div className={styles.field}>
              <label className={styles.label}>Your Name</label>
              <input
                className="neon-input"
                type="text"
                placeholder="Enter your name..."
                value={name}
                maxLength={20}
                onChange={e => { setName(e.target.value); setError(""); }}
                autoFocus
              />
              {error && <p className={styles.error}>⚠ {error}</p>}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Starting Level</label>
              <select
                className="neon-select"
                value={level}
                onChange={e => setLevel(Number(e.target.value))}
              >
                {LEVELS.map(l => (
                  <option key={l.level} value={l.level}>
                    Level {l.level} — {l.label} ({l.gridSize}×{l.gridSize})
                  </option>
                ))}
              </select>
            </div>

            {selectedLevel && (
              <div className={styles.levelInfo} style={{ borderColor: selectedLevel.color + "44" }}>
                <div className={styles.levelStat}>
                  <span className={styles.statLabel}>Grid</span>
                  <span className={styles.statVal} style={{ color: selectedLevel.color }}>
                    {selectedLevel.gridSize}×{selectedLevel.gridSize}
                  </span>
                </div>
                <div className={styles.levelStat}>
                  <span className={styles.statLabel}>Time</span>
                  <span className={styles.statVal} style={{ color: selectedLevel.color }}>
                    {selectedLevel.timeLimit}s
                  </span>
                </div>
                <div className={styles.levelStat}>
                  <span className={styles.statLabel}>Difficulty</span>
                  <span className={styles.statVal} style={{ color: selectedLevel.color }}>
                    {selectedLevel.label}
                  </span>
                </div>
              </div>
            )}

            <button type="submit" className="btn-neon green" style={{ width: "100%" }}>
              <span>🎮 Start Game</span>
            </button>

            <p className={styles.adminHint}>
              Admin?{" "}
              <button
                type="button"
                className={styles.adminLink}
                onClick={() => { playClick(); navigate("/admin"); }}
              >
                Access Panel →
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
