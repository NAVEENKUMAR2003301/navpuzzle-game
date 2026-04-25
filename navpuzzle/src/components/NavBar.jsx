import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { playLogoClick } from "../data/sounds";
import styles from "./NavBar.module.css";

export default function NavBar({ playerName = "" }) {
  const [time, setTime] = useState(new Date());
  const [logoPop, setLogoPop] = useState(false);
  const [logoRainbow, setLogoRainbow] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  function handleLogoClick() {
    playLogoClick();
    setLogoPop(true);
    setLogoRainbow(true);
    setTimeout(() => setLogoPop(false), 600);
    setTimeout(() => setLogoRainbow(false), 2000);
  }

  const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const dateStr = `${days[time.getDay()]}, ${months[time.getMonth()]} ${time.getDate()}, ${time.getFullYear()}`;
  const timeStr = time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  return (
    <nav className={styles.nav}>
      <button
        className={`${styles.logo} ${logoPop ? styles.logoPop : ""} ${logoRainbow ? styles.logoRainbow : ""}`}
        onClick={handleLogoClick}
        aria-label="NavPuzzle Home"
      >
        <span className={styles.logoIcon}>⬛</span>
        <span className={styles.logoText}>NavPuzzle</span>
      </button>

      <div className={styles.center}>
        {playerName && (
          <span className={styles.playerBadge}>
            <span className={styles.dot} />
            {playerName}
          </span>
        )}
      </div>

      <div className={styles.clock}>
        <div className={styles.timeStr}>{timeStr}</div>
        <div className={styles.dateStr}>{dateStr}</div>
      </div>
    </nav>
  );
}
