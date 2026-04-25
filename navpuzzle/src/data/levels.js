// NavPuzzle - 10 Levels (1-5 easy/medium, 6-10 hard)
// Each level: gridSize, timeLimit(seconds), shuffleMoves

export const LEVELS = [
  { level: 1, gridSize: 3, timeLimit: 120, shuffleMoves: 20, label: "Beginner",    color: "#00ff88" },
  { level: 2, gridSize: 3, timeLimit: 100, shuffleMoves: 30, label: "Easy",        color: "#00e5ff" },
  { level: 3, gridSize: 3, timeLimit: 90,  shuffleMoves: 40, label: "Warm Up",     color: "#7c4dff" },
  { level: 4, gridSize: 4, timeLimit: 150, shuffleMoves: 50, label: "Normal",      color: "#ff6d00" },
  { level: 5, gridSize: 4, timeLimit: 120, shuffleMoves: 60, label: "Medium",      color: "#ffd600" },
  { level: 6, gridSize: 4, timeLimit: 90,  shuffleMoves: 80, label: "Challenging", color: "#ff1744" },
  { level: 7, gridSize: 4, timeLimit: 75,  shuffleMoves: 100,label: "Hard",        color: "#f50057" },
  { level: 8, gridSize: 5, timeLimit: 180, shuffleMoves: 120,label: "Expert",      color: "#d500f9" },
  { level: 9, gridSize: 5, timeLimit: 150, shuffleMoves: 150,label: "Master",      color: "#aa00ff" },
  { level: 10,gridSize: 5, timeLimit: 120, shuffleMoves: 200,label: "Legendary",   color: "#ff6d00" },
];

// Generate solved state for a given grid size
export function generateSolvedState(gridSize) {
  const total = gridSize * gridSize;
  const tiles = [];
  for (let i = 0; i < total - 1; i++) tiles.push(i + 1);
  tiles.push(0); // 0 = empty
  return tiles;
}

// Check if puzzle is solvable
function getInversions(tiles) {
  let inversions = 0;
  const flat = tiles.filter(t => t !== 0);
  for (let i = 0; i < flat.length; i++)
    for (let j = i + 1; j < flat.length; j++)
      if (flat[i] > flat[j]) inversions++;
  return inversions;
}

export function isSolvable(tiles, gridSize) {
  const inversions = getInversions(tiles);
  if (gridSize % 2 === 1) return inversions % 2 === 0;
  const emptyRow = Math.floor(tiles.indexOf(0) / gridSize);
  const emptyFromBottom = gridSize - emptyRow;
  if (emptyFromBottom % 2 === 0) return inversions % 2 === 1;
  return inversions % 2 === 0;
}

// Shuffle tiles
export function shuffleTiles(gridSize, moves) {
  let tiles = generateSolvedState(gridSize);
  let emptyIdx = tiles.indexOf(0);

  for (let i = 0; i < moves; i++) {
    const row = Math.floor(emptyIdx / gridSize);
    const col = emptyIdx % gridSize;
    const neighbors = [];
    if (row > 0) neighbors.push(emptyIdx - gridSize);
    if (row < gridSize - 1) neighbors.push(emptyIdx + gridSize);
    if (col > 0) neighbors.push(emptyIdx - 1);
    if (col < gridSize - 1) neighbors.push(emptyIdx + 1);
    const swapIdx = neighbors[Math.floor(Math.random() * neighbors.length)];
    [tiles[emptyIdx], tiles[swapIdx]] = [tiles[swapIdx], tiles[emptyIdx]];
    emptyIdx = swapIdx;
  }
  return tiles;
}

export function isSolved(tiles, gridSize) {
  const solved = generateSolvedState(gridSize);
  return tiles.every((t, i) => t === solved[i]);
}

export function getProgress(tiles, gridSize) {
  const solved = generateSolvedState(gridSize);
  const correct = tiles.filter((t, i) => t === solved[i] && t !== 0).length;
  return Math.round((correct / (gridSize * gridSize - 1)) * 100);
}
