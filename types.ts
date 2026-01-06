
export type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Expert';
export type GridSize = 4 | 6 | 9;

export interface SudokuCell {
  value: number | null;
  fixed: boolean; // Pre-filled cells
  notes: number[];
  valid: boolean;
}

export type Grid = SudokuCell[][];

export interface GameState {
  grid: Grid;
  gridSize: GridSize;
  difficulty: Difficulty;
  time: number;
  isPaused: boolean;
  history: Grid[];
  selectedCell: [number, number] | null;
  mistakes: number;
  isWon: boolean;
}

export interface HintResponse {
  row: number;
  col: number;
  value: number;
  explanation: string;
}
