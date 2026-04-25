// NavPuzzle Sound Engine — Web Audio API (no external files needed)

let ctx = null;
let muted = false;

function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  return ctx;
}

function resume() {
  const c = getCtx();
  if (c.state === "suspended") c.resume();
}

export function setMuted(val) { muted = val; }
export function isMuted() { return muted; }

function playTone({ freq = 440, type = "sine", duration = 0.1, gain = 0.3, detune = 0, delay = 0 } = {}) {
  if (muted) return;
  resume();
  const c = getCtx();
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.connect(g);
  g.connect(c.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, c.currentTime + delay);
  osc.detune.setValueAtTime(detune, c.currentTime + delay);
  g.gain.setValueAtTime(gain, c.currentTime + delay);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + delay + duration);
  osc.start(c.currentTime + delay);
  osc.stop(c.currentTime + delay + duration + 0.05);
}

export function playMove() {
  playTone({ freq: 300, type: "square", duration: 0.07, gain: 0.15 });
}

export function playInvalidMove() {
  playTone({ freq: 120, type: "sawtooth", duration: 0.1, gain: 0.2 });
  playTone({ freq: 100, type: "sawtooth", duration: 0.1, gain: 0.2, delay: 0.05 });
}

export function playProgress25() {
  // Cheerful 3-note riff
  [523, 659, 784].forEach((f, i) => playTone({ freq: f, type: "sine", duration: 0.15, gain: 0.3, delay: i * 0.1 }));
}

export function playProgress50() {
  [523, 659, 784, 1047].forEach((f, i) => playTone({ freq: f, type: "triangle", duration: 0.18, gain: 0.35, delay: i * 0.1 }));
}

export function playWin() {
  const melody = [523, 659, 784, 1047, 1319];
  melody.forEach((f, i) => {
    playTone({ freq: f, type: "sine", duration: 0.25, gain: 0.4, delay: i * 0.12 });
    playTone({ freq: f * 1.25, type: "triangle", duration: 0.2, gain: 0.2, delay: i * 0.12 + 0.04 });
  });
}

export function playLose() {
  [400, 320, 260, 200].forEach((f, i) => playTone({ freq: f, type: "sawtooth", duration: 0.2, gain: 0.3, delay: i * 0.15 }));
}

export function playLevelUp() {
  [784, 1047, 1319, 1568].forEach((f, i) => {
    playTone({ freq: f, type: "sine", duration: 0.2, gain: 0.4, delay: i * 0.1 });
    playTone({ freq: f / 2, type: "triangle", duration: 0.2, gain: 0.15, delay: i * 0.1 });
  });
}

export function playLogoClick() {
  // Funny "boing" sound
  const c = getCtx();
  if (muted) return;
  resume();
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.connect(g);
  g.connect(c.destination);
  osc.type = "sine";
  osc.frequency.setValueAtTime(200, c.currentTime);
  osc.frequency.exponentialRampToValueAtTime(1200, c.currentTime + 0.15);
  osc.frequency.exponentialRampToValueAtTime(400, c.currentTime + 0.35);
  g.gain.setValueAtTime(0.5, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.5);
  osc.start(c.currentTime);
  osc.stop(c.currentTime + 0.55);

  // Bonus layered blips
  [800, 1200, 600].forEach((f, i) =>
    playTone({ freq: f, type: "square", duration: 0.08, gain: 0.1, delay: 0.05 + i * 0.06 })
  );
}

export function playClick() {
  playTone({ freq: 600, type: "sine", duration: 0.06, gain: 0.2 });
}

export function playTimerWarning() {
  playTone({ freq: 880, type: "square", duration: 0.08, gain: 0.25 });
}
