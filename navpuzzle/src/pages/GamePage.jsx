import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import ConfettiBlast from "../components/ConfettiBlast";
import { LEVELS, shuffleTiles, isSolved, getProgress, generateSolvedState } from "../data/levels";
import { savePlayerSession } from "../data/storage";
import {
  playMove, playInvalidMove, playProgress25, playProgress50,
  playWin, playLose, playLevelUp, playClick, playTimerWarning
} from "../data/sounds";
import styles from "./GamePage.module.css";

export default function GamePage() {
  const navigate = useNavigate();
  const playerName = sessionStorage.getItem("np_player") || "Player";
  const startLevel = Number(sessionStorage.getItem("np_level") || 1);

  const [currentLevel, setCurrentLevel] = useState(startLevel);
  const [tiles, setTiles] = useState([]);
  const [moves, setMoves] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [gameState, setGameState] = useState("playing"); // playing | won | lost
  const [progress, setProgress] = useState(0);
  const [milestone, setMilestone] = useState(0); // 25, 50, 100
  const [showResult, setShowResult] = useState(false);
  const [shakeTile, setShakeTile] = useState(null);
  const [movingTile, setMovingTile] = useState(null);
  const [confettiLevel, setConfettiLevel] = useState(0);
  const [sessionStart] = useState(Date.now());
  const timerRef = useRef(null);
  const warningRef = useRef(false);

  const levelData = LEVELS[currentLevel - 1];

  const initLevel = useCallback((lvl) => {
    const ld = LEVELS[lvl - 1];
    const shuffled = shuffleTiles(ld.gridSize, ld.shuffleMoves);
    setTiles(shuffled);
    setMoves(0);
    setTimeLeft(ld.timeLimit);
    setGameState("playing");
    setProgress(0);
    setMilestone(0);
    setShowResult(false);
    setConfettiLevel(0);
    warningRef.current = false;
  }, []);

  useEffect(() => { initLevel(currentLevel); }, [currentLevel, initLevel]);

  // Timer
  useEffect(() => {
    if (gameState !== "playing") { clearInterval(timerRef.current); return; }
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          handleGameOver(false);
          return 0;
        }
        if (t <= 10 && !warningRef.current) {
          warningRef.current = true;
        }
        if (t <= 10) playTimerWarning();
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [gameState]);

  function handleGameOver(won) {
    setGameState(won ? "won" : "lost");
    setShowResult(true);
    const timeTaken = levelData.timeLimit - timeLeft;
    savePlayerSession({
      name: playerName,
      level: currentLevel,
      won,
      moves,
      timeTaken,
    });
    if (won) {
      playWin();
      setConfettiLevel(3);
    } else {
      playLose();
    }
  }

  function moveTile(idx) {
    if (gameState !== "playing") return;
    const grid = levelData.gridSize;
    const emptyIdx = tiles.indexOf(0);
    const row = Math.floor(idx / grid), col = idx % grid;
    const eRow = Math.floor(emptyIdx / grid), eCol = emptyIdx % grid;
    const isAdjacent = (row === eRow && Math.abs(col - eCol) === 1) ||
                       (col === eCol && Math.abs(row - eRow) === 1);
    if (!isAdjacent) {
      setShakeTile(idx);
      playInvalidMove();
      setTimeout(() => setShakeTile(null), 300);
      return;
    }
    setMovingTile(idx);
    setTimeout(() => setMovingTile(null), 120);
    playMove();
    const newTiles = [...tiles];
    [newTiles[emptyIdx], newTiles[idx]] = [newTiles[idx], newTiles[emptyIdx]];
    const newMoves = moves + 1;
    setTiles(newTiles);
    setMoves(newMoves);

    const newProgress = getProgress(newTiles, grid);
    setProgress(newProgress);

    // Milestone animations
    if (newProgress >= 100 && milestone < 100) {
      setMilestone(100);
      setConfettiLevel(3);
      setTimeout(() => handleGameOver(true), 200);
    } else if (newProgress >= 50 && milestone < 50) {
      setMilestone(50);
      setConfettiLevel(2);
      playProgress50();
    } else if (newProgress >= 25 && milestone < 25) {
      setMilestone(25);
      setConfettiLevel(1);
      playProgress25();
    }
  }

  function handleKeyDown(e) {
    if (gameState !== "playing") return;
    const grid = levelData.gridSize;
    const emptyIdx = tiles.indexOf(0);
    let targetIdx = -1;
    if (e.key === "ArrowLeft")  targetIdx = emptyIdx + 1;
    if (e.key === "ArrowRight") targetIdx = emptyIdx - 1;
    if (e.key === "ArrowUp")    targetIdx = emptyIdx + grid;
    if (e.key === "ArrowDown")  targetIdx = emptyIdx - grid;
    if (targetIdx >= 0 && targetIdx < tiles.length) moveTile(targetIdx);
  }

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  function nextLevel() {
    if (currentLevel >= 10) return;
    playLevelUp();
    setCurrentLevel(l => l + 1);
  }

  function retryLevel() {
    playClick();
    initLevel(currentLevel);
  }

  function exitGame() {
    playClick();
    navigate("/feedback");
  }

  const grid = levelData?.gridSize || 3;
  const solved = generateSolvedState(grid);
  const timerPct = (timeLeft / levelData?.timeLimit) * 100;
  const timerColor = timerPct > 40 ? "var(--neon-green)" : timerPct > 15 ? "var(--neon-yellow)" : "#ff1744";

  return (
    <div className={styles.page} style={{ outline: "none" }}>
      <NavBar playerName={playerName} />

      {confettiLevel >= 1 && <ConfettiBlast intensity={confettiLevel} active={confettiLevel > 0} />}

      <div className={styles.container}>
        {/* HUD */}
        <div className={`glass-card ${styles.hud}`}>
          <div className={styles.hudBlock}>
            <span className={styles.hudLabel}>Level</span>
            <span className={styles.hudVal} style={{ color: levelData.color }}>
              {currentLevel}/10
            </span>
          </div>
          <div className={styles.hudBlock}>
            <span className={styles.hudLabel}>Difficulty</span>
            <span className={styles.hudVal} style={{ color: levelData.color, fontSize: "0.85rem" }}>
              {levelData.label}
            </span>
          </div>
          <div className={styles.hudBlock}>
            <span className={styles.hudLabel}>Moves</span>
            <span className={styles.hudVal}>{moves}</span>
          </div>
          <div className={styles.hudBlock}>
            <span className={styles.hudLabel}>Time</span>
            <span className={styles.hudVal} style={{ color: timerColor, textShadow: `0 0 10px ${timerColor}` }}>
              {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
            </span>
          </div>
        </div>

        {/* Timer bar */}
        <div className="progress-bar-wrap" style={{ margin: "0 4px" }}>
          <div
            className="progress-bar-fill"
            style={{ width: `${timerPct}%`, background: `linear-gradient(90deg, ${timerColor}, ${timerColor}99)` }}
          />
        </div>

        {/* Progress */}
        <div className={styles.progressRow}>
          <span className={styles.progressLabel}>Progress: {progress}%</span>
          <div className={styles.milestones}>
            <span className={`${styles.ms} ${milestone >= 25 ? styles.msActive : ""}`}>25%</span>
            <span className={`${styles.ms} ${milestone >= 50 ? styles.msActive : ""}`}>50%</span>
            <span className={`${styles.ms} ${milestone >= 100 ? styles.msActive : ""}`}>100%</span>
          </div>
        </div>
        <div className="progress-bar-wrap">
          <div
            className="progress-bar-fill"
            style={{
              width: `${progress}%`,
              background: progress >= 100 ? "linear-gradient(90deg,#00ff88,#00e5ff)"
                : progress >= 50 ? "linear-gradient(90deg,#ffd600,#ff6d00)"
                : "linear-gradient(90deg,#7c4dff,#00e5ff)"
            }}
          />
        </div>

        {/* Milestone banner */}
        {milestone === 25 && gameState === "playing" && (
          <div className={`${styles.banner} ${styles.banner25}`}>
            🎉 25% Done! Keep going, {playerName}!
          </div>
        )}
        {milestone === 50 && gameState === "playing" && (
          <div className={`${styles.banner} ${styles.banner50}`}>
            🔥 HALFWAY THERE! You're on fire, {playerName}!
          </div>
        )}

        {/* Puzzle board */}
        <div className={styles.boardWrap}>
          <div
            className={styles.board}
            style={{
              gridTemplateColumns: `repeat(${grid}, 1fr)`,
              gridTemplateRows: `repeat(${grid}, 1fr)`,
            }}
          >
            {tiles.map((tile, idx) => {
              const isEmpty = tile === 0;
              const isCorrect = tile !== 0 && tile === solved[idx];
              const isShaking = shakeTile === idx;
              const isMoving = movingTile === idx;

              return (
                <button
                  key={idx}
                  className={`
                    ${styles.tile}
                    ${isEmpty ? styles.tileEmpty : ""}
                    ${isCorrect ? styles.tileCorrect : ""}
                    ${isShaking ? styles.tileShake : ""}
                    ${isMoving ? styles.tileMove : ""}
                  `}
                  style={!isEmpty ? {
                    fontSize: grid === 5 ? "1.1rem" : grid === 4 ? "1.3rem" : "1.7rem",
                  } : {}}
                  onClick={() => !isEmpty && moveTile(idx)}
                  disabled={isEmpty}
                  aria-label={isEmpty ? "empty" : `tile ${tile}`}
                >
                  {!isEmpty && <span>{tile}</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Controls */}
        <div className={styles.controls}>
          <button className="btn-neon" onClick={retryLevel}><span>↺ Retry</span></button>
          <button className="btn-neon pink" onClick={exitGame}><span>⏏ Exit</span></button>
        </div>
      </div>

      {/* Result overlay */}
      {showResult && (
        <div className={styles.overlay}>
          <div className={`glass-card ${styles.resultCard}`}>
            {gameState === "won" ? (
              <>
                <div className={styles.winName}>{playerName}</div>
                <div className={styles.winTitle}>CONQUERED!</div>
                <div className={styles.winEmoji}>🏆</div>
                <p className={styles.winMsg}>Level {currentLevel} Complete!</p>
                <div className={styles.resultStats}>
                  <span>🎯 Moves: {moves}</span>
                  <span>⏱ Time: {levelData.timeLimit - timeLeft}s</span>
                  <span>📊 {levelData.label}</span>
                </div>
                <div className={styles.resultBtns}>
                  {currentLevel < 10 && (
                    <button className="btn-neon green" onClick={nextLevel}><span>Next Level →</span></button>
                  )}
                  {currentLevel === 10 && (
                    <div className={styles.champion}>
                      🎉 ALL 10 LEVELS COMPLETE! CHAMPION! 🎉
                    </div>
                  )}
                  <button className="btn-neon" onClick={retryLevel}><span>↺ Retry</span></button>
                  <button className="btn-neon pink" onClick={exitGame}><span>⏏ Exit</span></button>
                </div>
              </>
            ) : (
              <>
                <div className={styles.loseTitle}>TIME'S UP!</div>
                <div className={styles.loseEmoji}>💀</div>
                <p className={styles.loseMsg}>Better luck next time, {playerName}!</p>
                <div className={styles.resultStats}>
                  <span>🎯 Moves: {moves}</span>
                  <span>📊 Progress: {progress}%</span>
                </div>
                <div className={styles.resultBtns}>
                  <button className="btn-neon green" onClick={retryLevel}><span>↺ Try Again</span></button>
                  <button className="btn-neon pink" onClick={exitGame}><span>⏏ Exit</span></button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
