
import React, { useState, useEffect, useCallback } from 'react';
import { Difficulty, GameState, Grid, GridSize } from './types';
import { createEmptyGrid, generatePuzzle, checkWin, getSubgridDimensions } from './utils/sudokuLogic';

const Header = () => (
  <header className="py-8 text-center">
    <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 tracking-tighter">
      ZEN SUDOKU
    </h1>
    <p className="text-slate-500 text-[10px] font-black tracking-[0.4em] mt-2 uppercase opacity-80">Neon Mind Master</p>
  </header>
);

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    grid: createEmptyGrid(9),
    gridSize: 9,
    difficulty: 'Medium',
    time: 0,
    isPaused: false,
    history: [],
    selectedCell: null,
    mistakes: 0,
    isWon: false,
  });
  
  const [solution, setSolution] = useState<number[][]>([]);
  const [isNotesMode, setIsNotesMode] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSelector, setShowSelector] = useState(false);

  const startNewGame = useCallback((size: GridSize = gameState.gridSize, diff: Difficulty = gameState.difficulty) => {
    setIsGenerating(true);
    setShowSelector(false);
    setTimeout(() => {
      const { puzzle, solution: sol } = generatePuzzle(diff, size);
      setSolution(sol);
      setGameState(prev => ({
        ...prev,
        grid: puzzle,
        gridSize: size,
        difficulty: diff,
        time: 0,
        isPaused: false,
        history: [puzzle],
        selectedCell: null,
        mistakes: 0,
        isWon: false,
      }));
      setIsGenerating(false);
    }, 100);
  }, [gameState.gridSize, gameState.difficulty]);

  useEffect(() => {
    startNewGame();
  }, []);

  useEffect(() => {
    if (gameState.isPaused || gameState.isWon) return;
    const interval = setInterval(() => {
      setGameState(prev => ({ ...prev, time: prev.time + 1 }));
    }, 1000);
    return () => clearInterval(interval);
  }, [gameState.isPaused, gameState.isWon]);

  const handleCellClick = (r: number, c: number) => {
    if (gameState.grid[r][c].fixed) {
      setGameState(prev => ({ ...prev, selectedCell: [r, c] }));
      setShowSelector(false);
      return;
    }
    setGameState(prev => ({ ...prev, selectedCell: [r, c] }));
    setShowSelector(true);
  };

  const handleNumberInput = (num: number | null) => {
    if (!gameState.selectedCell || gameState.isWon || gameState.isPaused) return;
    const [r, c] = gameState.selectedCell;
    const cell = gameState.grid[r][c];

    if (cell.fixed) return;

    const newGrid = gameState.grid.map((row, rIdx) => 
      row.map((col, cIdx) => {
        if (rIdx === r && cIdx === c) {
          if (isNotesMode && num !== null) {
            const newNotes = col.notes.includes(num) 
              ? col.notes.filter(n => n !== num) 
              : [...col.notes, num].sort();
            return { ...col, notes: newNotes };
          } else {
            const isCorrect = num === null || num === solution[r][c];
            if (!isCorrect && num !== null) {
              setGameState(prev => ({ ...prev, mistakes: prev.mistakes + 1 }));
            }
            return { ...col, value: num, valid: isCorrect, notes: [] };
          }
        }
        return col;
      })
    );

    setGameState(prev => ({
      ...prev,
      grid: newGrid,
      history: [...prev.history, newGrid],
      isWon: checkWin(newGrid, solution, gameState.gridSize)
    }));
    
    if (!isNotesMode) setShowSelector(false);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const { rows, cols } = getSubgridDimensions(gameState.gridSize);

  const subgridColors = [
    'bg-indigo-500/5', 'bg-cyan-500/5', 'bg-purple-500/5',
    'bg-emerald-500/5', 'bg-blue-500/5', 'bg-rose-500/5',
    'bg-amber-500/5', 'bg-violet-500/5', 'bg-teal-500/5'
  ];

  const getSubgridColor = (r: number, c: number) => {
    const subR = Math.floor(r / rows);
    const subC = Math.floor(c / cols);
    const totalCols = gameState.gridSize / cols;
    const index = (subR * totalCols + subC) % subgridColors.length;
    return subgridColors[index];
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-4 pb-12 transition-colors duration-500 bg-slate-950 text-slate-100 selection:bg-indigo-500/30">
      <Header />

      <main className="w-full max-w-4xl flex flex-col items-center gap-6">
        
        <div className="flex flex-wrap justify-center gap-4">
           <div className="flex bg-slate-900/80 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 shadow-2xl">
            {[4, 6, 9].map((s) => (
              <button
                key={s}
                onClick={() => startNewGame(s as GridSize)}
                className={`px-6 py-2 rounded-xl text-sm font-black transition-all ${gameState.gridSize === s ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/40' : 'text-slate-500 hover:text-slate-300'}`}
              >
                {s}x{s}
              </button>
            ))}
          </div>

          <div className="flex bg-slate-900/80 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 shadow-2xl">
            {(['Easy', 'Medium', 'Hard', 'Expert'] as Difficulty[]).map(d => (
              <button
                key={d}
                onClick={() => startNewGame(gameState.gridSize, d)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${gameState.difficulty === d ? 'text-indigo-400 bg-white/5 shadow-inner' : 'text-slate-500 hover:text-slate-300'}`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between w-full max-w-[480px] font-bold px-4 text-xs">
          <div className="flex items-center gap-4">
            <span className="text-slate-500 uppercase tracking-[0.2em] text-[10px]">Errors</span>
            <div className="flex gap-2">
              {[1, 2, 3].map(i => (
                <div key={i} className={`w-3 h-3 rounded-full border border-white/5 shadow-sm transition-all duration-300 ${gameState.mistakes >= i ? 'bg-rose-500 shadow-rose-500/50 scale-110' : 'bg-slate-800'}`}></div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-slate-500 uppercase tracking-[0.2em] text-[10px]">Session</span>
            <span className="text-cyan-400 font-mono text-lg tabular-nums tracking-tighter">{formatTime(gameState.time)}</span>
          </div>
        </div>

        <div className="relative p-1 bg-slate-600 rounded-2xl shadow-[0_0_80px_-20px_rgba(79,70,229,0.4)] border-4 border-slate-600 overflow-hidden">
          <div 
            className="grid bg-slate-900 transition-all duration-300"
            style={{ 
              gridTemplateColumns: `repeat(${gameState.gridSize}, minmax(0, 1fr))`,
              width: 'min(90vw, 480px)',
              height: 'min(90vw, 480px)'
            }}
          >
            {gameState.grid.map((row, rIdx) => 
              row.map((cell, cIdx) => {
                const isSelected = gameState.selectedCell?.[0] === rIdx && gameState.selectedCell?.[1] === cIdx;
                const isSameValue = cell.value !== null && gameState.selectedCell && gameState.grid[gameState.selectedCell[0]][gameState.selectedCell[1]].value === cell.value;
                const isRelated = gameState.selectedCell && (gameState.selectedCell[0] === rIdx || gameState.selectedCell[1] === cIdx);
                const isBox = gameState.selectedCell && (Math.floor(rIdx / rows) === Math.floor(gameState.selectedCell[0] / rows) && Math.floor(cIdx / cols) === Math.floor(gameState.selectedCell[1] / cols));
                
                const subgridColor = getSubgridColor(rIdx, cIdx);

                const isSubgridBottom = (rIdx + 1) % rows === 0 && rIdx !== gameState.gridSize - 1;
                const isSubgridRight = (cIdx + 1) % cols === 0 && cIdx !== gameState.gridSize - 1;

                return (
                  <div 
                    key={`${rIdx}-${cIdx}`}
                    onClick={() => handleCellClick(rIdx, cIdx)}
                    className={`
                      relative flex items-center justify-center cursor-pointer select-none transition-all duration-150
                      border-slate-700/60
                      ${isSubgridBottom ? 'border-b-[4px] border-slate-600' : 'border-b-[1.5px]'}
                      ${isSubgridRight ? 'border-r-[4px] border-slate-600' : 'border-r-[1.5px]'}
                      ${subgridColor}
                      ${isRelated || isBox ? 'bg-indigo-500/[0.08]' : ''}
                      ${isSelected ? 'bg-indigo-500 text-white z-10 scale-[1.06] shadow-[0_0_40px_rgba(99,102,241,0.7)] !border-none rounded-lg' : ''}
                      ${!isSelected && isSameValue ? 'bg-indigo-500/20 ring-1 ring-indigo-500/40' : ''}
                      ${!cell.valid && cell.value !== null ? '!bg-rose-500/20 !text-rose-400 !border-rose-500/50 ring-2 ring-rose-500/40 z-10' : ''}
                      ${cell.fixed ? 'font-black text-slate-100' : 'font-medium text-cyan-400'}
                      text-xl sm:text-3xl
                    `}
                  >
                    {cell.value || (
                      <div className="grid grid-cols-3 w-full h-full p-1.5 pointer-events-none opacity-40">
                        {Array.from({ length: gameState.gridSize }, (_, i) => i + 1).map(n => (
                          <div key={n} className="text-[8px] sm:text-[10px] leading-none flex items-center justify-center text-slate-500 font-bold">
                            {cell.notes.includes(n) ? n : ''}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
          
          {showSelector && gameState.selectedCell && !gameState.isWon && (
            <div 
              className="absolute inset-0 flex items-center justify-center z-40 bg-slate-950/60 backdrop-blur-md rounded-xl animate-in fade-in zoom-in duration-200"
              onClick={() => setShowSelector(false)}
            >
              <div 
                className="bg-slate-900 p-8 rounded-[40px] shadow-2xl border border-white/5 w-full max-w-[340px] ring-1 ring-white/10"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-6 px-1">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Select Value</span>
                  <button 
                    onClick={() => setIsNotesMode(!isNotesMode)}
                    className={`px-4 py-2 rounded-full text-[10px] font-black transition-all uppercase tracking-widest ${isNotesMode ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}
                  >
                    Notes: {isNotesMode ? 'ON' : 'OFF'}
                  </button>
                </div>
                <div className={`grid gap-4 ${gameState.gridSize === 4 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                  {Array.from({ length: gameState.gridSize }, (_, i) => i + 1).map(num => (
                    <button
                      key={num}
                      onClick={() => handleNumberInput(num)}
                      className="aspect-square bg-slate-800/50 hover:bg-indigo-500 hover:text-white rounded-[24px] text-2xl font-black text-slate-300 transition-all active:scale-90 flex items-center justify-center border border-white/5 shadow-xl hover:shadow-indigo-500/20"
                    >
                      {num}
                    </button>
                  ))}
                </div>
                <div className="mt-8 flex gap-4">
                  <button 
                    onClick={() => handleNumberInput(null)}
                    className="flex-1 py-4 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-2xl text-[10px] font-black transition-all uppercase tracking-widest border border-rose-500/20"
                  >
                    Clear
                  </button>
                  <button 
                    onClick={() => setShowSelector(false)}
                    className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-2xl text-[10px] font-black transition-all uppercase tracking-widest border border-slate-700"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}

          {isGenerating && (
            <div className="absolute inset-0 flex items-center justify-center z-50 bg-slate-950/90 backdrop-blur-xl rounded-xl">
              <div className="flex flex-col items-center gap-6">
                <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                <p className="text-indigo-400 font-black text-xs uppercase tracking-[0.4em] animate-pulse">Constructing Universe...</p>
              </div>
            </div>
          )}

          {gameState.isWon && (
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-700 flex flex-col items-center justify-center z-50 animate-in fade-in zoom-in duration-700 text-white rounded-xl shadow-2xl">
              <div className="text-7xl mb-8 animate-bounce">✨</div>
              <h2 className="text-6xl font-black mb-4 tracking-tighter italic drop-shadow-lg">COMPLETED</h2>
              <p className="mb-12 text-indigo-100 font-black tracking-[0.3em] uppercase text-xs opacity-80">Final Time: {formatTime(gameState.time)}</p>
              <button 
                onClick={() => startNewGame()}
                className="bg-white text-indigo-600 px-14 py-5 rounded-3xl font-black shadow-2xl hover:scale-105 active:scale-95 transition-all text-xs uppercase tracking-[0.2em]"
              >
                New Voyage
              </button>
            </div>
          )}
        </div>

        <div className="w-full max-w-[480px] flex flex-col gap-4 px-2">
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => setGameState(p => ({ ...p, isPaused: !p.isPaused }))}
              className="flex items-center justify-center gap-3 bg-slate-900/80 backdrop-blur-md border border-white/10 p-5 rounded-[24px] group hover:bg-indigo-600 hover:border-indigo-400 transition-all duration-300 shadow-xl active:scale-95"
            >
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:bg-white group-hover:text-indigo-600 transition-colors">
                {gameState.isPaused ? (
                   <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                ) : (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                )}
              </div>
              <span className="font-black text-[10px] uppercase tracking-[0.3em] text-slate-100 group-hover:text-white">
                {gameState.isPaused ? 'Resume' : 'Pause Game'}
              </span>
            </button>

            <button 
              onClick={() => startNewGame()}
              className="flex items-center justify-center gap-3 bg-slate-900/80 backdrop-blur-md border border-white/10 p-5 rounded-[24px] group hover:bg-rose-600 hover:border-rose-400 transition-all duration-300 shadow-xl active:scale-95"
            >
              <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400 group-hover:bg-white group-hover:text-rose-600 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              </div>
              <span className="font-black text-[10px] uppercase tracking-[0.3em] text-slate-100 group-hover:text-white">
                Reset Board
              </span>
            </button>
          </div>
        </div>
      </main>

      {gameState.isPaused && !gameState.isWon && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-3xl flex items-center justify-center z-[100] animate-in fade-in duration-500">
          <div className="text-center max-w-xs w-full p-12">
            <div className="w-28 h-28 bg-slate-900 border border-white/5 rounded-[48px] flex items-center justify-center mx-auto mb-10 shadow-3xl">
               <svg className="w-14 h-14 text-indigo-400 animate-pulse" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            </div>
            <h2 className="text-5xl font-black text-white mb-4 tracking-tighter">ZEN</h2>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mb-12">Flow Suspended</p>
            <button 
              onClick={() => setGameState(p => ({ ...p, isPaused: false }))}
              className="w-full bg-white text-slate-900 py-6 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-cyan-400 transition-all shadow-2xl active:scale-95"
            >
              Re-Enter Flow
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
