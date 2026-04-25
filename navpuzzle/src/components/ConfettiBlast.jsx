import { useEffect, useRef } from "react";

const COLORS = ["#ff0080","#ff8c00","#ffd600","#00ff88","#00e5ff","#bf00ff","#ff1493","#7c4dff"];

export default function ConfettiBlast({ intensity = 1, active = true }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const particles = useRef([]);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    const count = Math.floor(80 * intensity);
    particles.current = [];
    for (let i = 0; i < count; i++) {
      particles.current.push({
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * 100,
        size: 6 + Math.random() * 10,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        speed: 2 + Math.random() * 4 * intensity,
        drift: (Math.random() - 0.5) * 3,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.2,
        shape: Math.random() > 0.5 ? "rect" : "circle",
        opacity: 1,
      });
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = 0;
      particles.current.forEach(p => {
        p.y += p.speed;
        p.x += p.drift;
        p.rot += p.rotSpeed;
        if (p.y > canvas.height * 0.7) p.opacity -= 0.015;
        if (p.opacity <= 0 || p.y > canvas.height) return;
        alive++;
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        if (p.shape === "rect") {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      if (alive > 0) animRef.current = requestAnimationFrame(draw);
    }

    animRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [active, intensity]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed", inset: 0, pointerEvents: "none",
        zIndex: 999, width: "100%", height: "100%",
      }}
    />
  );
}
