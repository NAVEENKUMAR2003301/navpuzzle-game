import { useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import { saveFeedback } from "../data/storage";
import { playClick, playWin } from "../data/sounds";
import styles from "./FeedbackPage.module.css";

const EMOJIS = ["😡", "😞", "😐", "😊", "🤩"];
const LABELS = ["Terrible", "Bad", "Okay", "Good", "Amazing!"];

export default function FeedbackPage() {
  const navigate = useNavigate();
  const playerName = sessionStorage.getItem("np_player") || "Player";

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (rating === 0) return;
    saveFeedback({ playerName, rating, comment });
    playWin();
    setSubmitted(true);
  }

  function goHome() {
    playClick();
    sessionStorage.removeItem("np_player");
    sessionStorage.removeItem("np_level");
    navigate("/");
  }

  function skipFeedback() {
    playClick();
    goHome();
  }

  if (submitted) {
    return (
      <div className={styles.page}>
        <NavBar playerName={playerName} />
        <div className={styles.center}>
          <div className={`glass-card ${styles.card}`} style={{ textAlign: "center" }}>
            <div className={styles.thankEmoji}>🙏</div>
            <h2 className={styles.thankTitle}>Thank You, {playerName}!</h2>
            <p className={styles.thankMsg}>Your feedback helps us make NavPuzzle even better.</p>
            <button className="btn-neon green" onClick={goHome}><span>↩ Play Again</span></button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <NavBar playerName={playerName} />
      <div className={styles.center}>
        <form className={`glass-card ${styles.card}`} onSubmit={handleSubmit}>
          <h2 className={styles.title}>How was your experience?</h2>
          <p className={styles.sub}>Tell us what you think about NavPuzzle, <strong>{playerName}</strong>!</p>

          {/* Emoji rating */}
          <div className={styles.emojiRow}>
            {EMOJIS.map((em, i) => (
              <button
                key={i}
                type="button"
                className={`${styles.emojiBtn} ${rating === i + 1 ? styles.emojiBtnActive : ""}`}
                onClick={() => { setRating(i + 1); playClick(); }}
                aria-label={LABELS[i]}
                title={LABELS[i]}
              >
                <span className={styles.emojiChar}>{em}</span>
                <span className={styles.emojiLabel}>{LABELS[i]}</span>
              </button>
            ))}
          </div>

          {rating > 0 && (
            <div className={styles.ratingDisplay}>
              <span className={styles.ratingEmoji}>{EMOJIS[rating - 1]}</span>
              <span className={styles.ratingLabel}>{LABELS[rating - 1]}</span>
            </div>
          )}

          <div className={styles.field}>
            <label className={styles.label}>Any comments? (optional)</label>
            <textarea
              className="neon-textarea"
              placeholder="What did you love? What can we improve?"
              value={comment}
              onChange={e => setComment(e.target.value)}
              maxLength={500}
              rows={4}
            />
            <span className={styles.charCount}>{comment.length}/500</span>
          </div>

          <div className={styles.btns}>
            <button
              type="submit"
              className="btn-neon green"
              disabled={rating === 0}
              style={{ opacity: rating === 0 ? 0.4 : 1 }}
            >
              <span>📤 Submit Feedback</span>
            </button>
            <button type="button" className="btn-neon" onClick={skipFeedback}>
              <span>Skip →</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
