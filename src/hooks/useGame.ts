import { useCallback, useEffect, useReducer } from 'react';
import { getRandomWord, isValidWord } from '../data/words';
import {
  buildEmptyBoard,
  evaluateGuess,
  GameStatus,
  getGameStatus,
  getWinMessage,
  KeyMap,
  mergeKeyMap,
  MAX_GUESSES,
  TileData,
  WORD_LENGTH,
} from '../utils/gameUtils';

// ── State ────────────────────────────────────────────────────────────────────

interface GameState {
  target: string;
  board: TileData[][];
  currentRow: number;
  currentCol: number;
  keyMap: KeyMap;
  status: GameStatus;
  toast: string;
  shakingRow: number | null;
  revealingRow: number | null;
  bouncingRow: number | null;
}

// ── Actions ──────────────────────────────────────────────────────────────────

type Action =
  | { type: 'TYPE'; letter: string }
  | { type: 'BACKSPACE' }
  | { type: 'SUBMIT'; valid: boolean }
  | { type: 'REVEAL_DONE'; tiles: TileData[]; isWin: boolean }
  | { type: 'BOUNCE_DONE' }
  | { type: 'CLEAR_TOAST' }
  | { type: 'RESET' };

function init(): GameState {
  return {
    target: getRandomWord(),
    board: buildEmptyBoard(),
    currentRow: 0,
    currentCol: 0,
    keyMap: {},
    status: 'playing',
    toast: '',
    shakingRow: null,
    revealingRow: null,
    bouncingRow: null,
  };
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'TYPE': {
      if (state.status !== 'playing') return state;
      if (state.currentCol >= WORD_LENGTH) return state;
      const board = state.board.map(r => [...r]);
      board[state.currentRow][state.currentCol] = { letter: action.letter, state: 'tbd' };
      return { ...state, board, currentCol: state.currentCol + 1 };
    }

    case 'BACKSPACE': {
      if (state.status !== 'playing') return state;
      if (state.currentCol === 0) return state;
      const col = state.currentCol - 1;
      const board = state.board.map(r => [...r]);
      board[state.currentRow][col] = { letter: '', state: 'empty' };
      return { ...state, board, currentCol: col };
    }

    case 'SUBMIT': {
      if (!action.valid) {
        return { ...state, shakingRow: state.currentRow, toast: 'Not in word list' };
      }
      if (state.currentCol < WORD_LENGTH) {
        return { ...state, shakingRow: state.currentRow, toast: 'Not enough letters' };
      }
      return { ...state, revealingRow: state.currentRow, shakingRow: null };
    }

    case 'REVEAL_DONE': {
      const board = state.board.map(r => [...r]);
      board[state.currentRow] = action.tiles;
      const nextRow = state.currentRow + 1;
      const keyMap = mergeKeyMap(state.keyMap, action.tiles);
      const status = getGameStatus(board, nextRow, state.target);

      if (action.isWin) {
        return {
          ...state, board, keyMap,
          currentRow: nextRow,
          revealingRow: null,
          bouncingRow: state.currentRow,
          status: 'won',
          toast: getWinMessage(nextRow),
        };
      }
      if (status === 'lost') {
        return {
          ...state, board, keyMap,
          currentRow: nextRow,
          revealingRow: null,
          status: 'lost',
          toast: state.target.toUpperCase(),
        };
      }
      return {
        ...state, board, keyMap,
        currentRow: nextRow,
        currentCol: 0,
        revealingRow: null,
        status: 'playing',
      };
    }

    case 'BOUNCE_DONE':
      return { ...state, bouncingRow: null };

    case 'CLEAR_TOAST':
      return { ...state, toast: '', shakingRow: null };

    case 'RESET':
      return init();

    default:
      return state;
  }
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useGame() {
  const [state, dispatch] = useReducer(reducer, undefined, init);

  const type = useCallback((letter: string) => {
    dispatch({ type: 'TYPE', letter: letter.toUpperCase() });
  }, []);

  const backspace = useCallback(() => {
    dispatch({ type: 'BACKSPACE' });
  }, []);

  const submit = useCallback(() => {
    const { board, currentRow, currentCol, status } = state;
    if (status !== 'playing') return;
    if (currentCol < WORD_LENGTH) {
      dispatch({ type: 'SUBMIT', valid: false });
      return;
    }
    const word = board[currentRow].map(t => t.letter).join('');
    const valid = isValidWord(word);
    if (!valid) {
      dispatch({ type: 'SUBMIT', valid: false });
      return;
    }
    dispatch({ type: 'SUBMIT', valid: true });

    // After animation delay, compute results
    const tiles = evaluateGuess(word, state.target);
    const isWin = tiles.every(t => t.state === 'correct');
    const delay = WORD_LENGTH * 300 + 100;
    setTimeout(() => dispatch({ type: 'REVEAL_DONE', tiles, isWin }), delay);
  }, [state]);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const clearShake = useCallback(() => {
    dispatch({ type: 'CLEAR_TOAST' });
  }, []);

  const bounceDone = useCallback(() => {
    dispatch({ type: 'BOUNCE_DONE' });
  }, []);

  // Auto-clear toast after delay
  useEffect(() => {
    if (!state.toast) return;
    if (state.status === 'lost') return; // keep "answer" toast until modal shows
    const t = setTimeout(() => dispatch({ type: 'CLEAR_TOAST' }), 1800);
    return () => clearTimeout(t);
  }, [state.toast, state.status]);

  // Physical keyboard listener
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === 'Enter') { submit(); return; }
      if (e.key === 'Backspace') { backspace(); return; }
      if (/^[a-zA-Z]$/.test(e.key)) { type(e.key); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [submit, backspace, type]);

  return { ...state, type, backspace, submit, reset, clearShake, bounceDone };
}
