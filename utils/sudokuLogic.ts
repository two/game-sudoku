
import { Difficulty, Grid, SudokuCell, GridSize } from '../types';

export const getSubgridDimensions = (size: GridSize): { rows: number; cols: number } => {
  switch (size) {
    case 4: return { rows: 2, cols: 2 };
    case 6: return { rows: 2, cols: 3 };
    case 9: return { rows: 3, cols: 3 };
    default: return { rows: 3, cols: 3 };
  }
};

export const createEmptyGrid = (size: GridSize): Grid => {
  return Array.from({ length: size }, () =>
    Array.from({ length: size }, () => ({
      value: null,
      fixed: false,
      notes: [],
      valid: true,
    }))
  );
};

export const isValid = (grid: (number | null)[][], row: number, col: number, num: number, size: GridSize): boolean => {
  // Check row
  for (let x = 0; x < size; x++) if (grid[row][x] === num) return false;
  // Check col
  for (let x = 0; x < size; x++) if (grid[x][col] === num) return false;
  
  // Check subgrid
  const { rows, cols } = getSubgridDimensions(size);
  const startRow = Math.floor(row / rows) * rows;
  const startCol = Math.floor(col / cols) * cols;
  
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (grid[i + startRow][j + startCol] === num) return false;
    }
  }
  return true;
};

const fillGrid = (grid: (number | null)[][], size: GridSize): boolean => {
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (grid[row][col] === null) {
        const numbers = Array.from({ length: size }, (_, i) => i + 1).sort(() => Math.random() - 0.5);
        for (const num of numbers) {
          if (isValid(grid, row, col, num, size)) {
            grid[row][col] = num;
            if (fillGrid(grid, size)) return true;
            grid[row][col] = null;
          }
        }
        return false;
      }
    }
  }
  return true;
};

export const generatePuzzle = (difficulty: Difficulty, size: GridSize): { puzzle: Grid; solution: number[][] } => {
  const grid: (number | null)[][] = Array.from({ length: size }, () => Array(size).fill(null));
  fillGrid(grid, size);
  
  const solution = grid.map(row => [...row as number[]]);
  const puzzle = grid.map(row => [...row]);

  let attempts = 0;
  // Dynamic cells to remove based on size and difficulty
  const baseRemoval = {
    4: { Easy: 4, Medium: 6, Hard: 8, Expert: 10 },
    6: { Easy: 10, Medium: 15, Hard: 20, Expert: 25 },
    9: { Easy: 35, Medium: 45, Hard: 55, Expert: 60 }
  }[size][difficulty];

  while (attempts < baseRemoval) {
    const row = Math.floor(Math.random() * size);
    const col = Math.floor(Math.random() * size);
    if (puzzle[row][col] !== null) {
      puzzle[row][col] = null;
      attempts++;
    }
  }

  const finalGrid: Grid = puzzle.map((row) =>
    row.map((val) => ({
      value: val,
      fixed: val !== null,
      notes: [],
      valid: true,
    }))
  );

  return { puzzle: finalGrid, solution };
};

export const checkWin = (grid: Grid, solution: number[][], size: GridSize): boolean => {
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c].value !== solution[r][c]) return false;
    }
  }
  return true;
};
