import { describe, it, expect } from 'vitest';
import {
  evaluateGuess,
  mergeKeyMap,
  buildEmptyBoard,
  getGameStatus,
  getWinMessage,
  MAX_GUESSES,
  WORD_LENGTH,
  WIN_MESSAGES,
} from '../utils/gameUtils';

// ── evaluateGuess ─────────────────────────────────────────────────────────────

describe('evaluateGuess', () => {
  it('marks all correct when guess equals target', () => {
    const result = evaluateGuess('crane', 'crane');
    result.forEach(t => expect(t.state).toBe('correct'));
  });

  it('marks all absent when no letters match', () => {
    const result = evaluateGuess('vvvvv', 'crane');
    result.forEach(t => expect(t.state).toBe('absent'));
  });

  it('marks correct positions green', () => {
    const result = evaluateGuess('crane', 'creed');
    expect(result[0].state).toBe('correct'); // C correct
    expect(result[1].state).toBe('correct'); // R correct
    expect(result[2].state).toBe('absent');  // A not in creed
    expect(result[3].state).toBe('absent');  // N not in creed
    expect(result[4].state).toBe('present'); // E present (in creed but wrong pos)
  });

  it('marks present (wrong-position) letters yellow', () => {
    const result = evaluateGuess('crane', 'nerve');
    // R: in "nerve" but not at position 1 — present
    expect(result[1].letter).toBe('R');
    expect(result[1].state).toBe('present');
    // E: in "nerve", position 4 — present (E is at index 1,4 in nerve; we put E at index 4)
    expect(result[4].letter).toBe('E');
    expect(result[4].state).toBe('correct'); // E at index 4, nerve[4]='e' ✓
  });

  it('handles duplicate letters correctly — no over-counting yellows', () => {
    // target: "abbey", guess: "eerie"
    // Only one 'e' in "abbey" (index 4)
    const result = evaluateGuess('eerie', 'abbey');
    const yellows = result.filter(t => t.state === 'present');
    const corrects = result.filter(t => t.state === 'correct');
    // At most one e can be yellow/green (abbey has one e)
    const eCount = result.filter(t => t.letter === 'E' && (t.state === 'present' || t.state === 'correct')).length;
    expect(eCount).toBeLessThanOrEqual(1);
  });

  it('handles duplicate letter where one is correct and one absent', () => {
    // target "sleep", guess "spell"
    // s: correct (0), p: correct (2→ wait, spell=s,p,e,l,l; sleep=s,l,e,e,p)
    const result = evaluateGuess('spell', 'sleep');
    expect(result[0].letter).toBe('S');
    expect(result[0].state).toBe('correct'); // S at 0 ✓
    expect(result[2].letter).toBe('E');
    expect(result[2].state).toBe('correct'); // E at 2 ✓ (sleep[2]=e)
  });

  it('returns correct letter values in result', () => {
    const result = evaluateGuess('hello', 'world');
    expect(result.map(t => t.letter)).toEqual(['H','E','L','L','O']);
  });

  it('is case-insensitive', () => {
    const lower = evaluateGuess('crane', 'crane');
    const upper = evaluateGuess('CRANE', 'CRANE');
    const mixed = evaluateGuess('Crane', 'cRANE');
    lower.forEach(t => expect(t.state).toBe('correct'));
    upper.forEach(t => expect(t.state).toBe('correct'));
    mixed.forEach(t => expect(t.state).toBe('correct'));
  });
});

// ── mergeKeyMap ───────────────────────────────────────────────────────────────

describe('mergeKeyMap', () => {
  it('adds new keys from tiles', () => {
    const map = mergeKeyMap({}, [
      { letter: 'A', state: 'correct' },
      { letter: 'B', state: 'absent' },
    ]);
    expect(map['A']).toBe('correct');
    expect(map['B']).toBe('absent');
  });

  it('never downgrades correct to present', () => {
    const initial = { A: 'correct' as const };
    const map = mergeKeyMap(initial, [{ letter: 'A', state: 'present' }]);
    expect(map['A']).toBe('correct');
  });

  it('never downgrades present to absent', () => {
    const initial = { A: 'present' as const };
    const map = mergeKeyMap(initial, [{ letter: 'A', state: 'absent' }]);
    expect(map['A']).toBe('present');
  });

  it('upgrades absent to present', () => {
    const initial = { A: 'absent' as const };
    const map = mergeKeyMap(initial, [{ letter: 'A', state: 'present' }]);
    expect(map['A']).toBe('present');
  });

  it('upgrades present to correct', () => {
    const initial = { A: 'present' as const };
    const map = mergeKeyMap(initial, [{ letter: 'A', state: 'correct' }]);
    expect(map['A']).toBe('correct');
  });

  it('skips tbd and empty states', () => {
    const map = mergeKeyMap({}, [
      { letter: 'A', state: 'tbd' },
      { letter: 'B', state: 'empty' },
    ]);
    expect(map['A']).toBeUndefined();
    expect(map['B']).toBeUndefined();
  });
});

// ── buildEmptyBoard ───────────────────────────────────────────────────────────

describe('buildEmptyBoard', () => {
  it(`creates ${MAX_GUESSES} rows`, () => {
    expect(buildEmptyBoard()).toHaveLength(MAX_GUESSES);
  });

  it(`each row has ${WORD_LENGTH} tiles`, () => {
    buildEmptyBoard().forEach(row => expect(row).toHaveLength(WORD_LENGTH));
  });

  it('all tiles are empty with no letter', () => {
    buildEmptyBoard().flat().forEach(tile => {
      expect(tile.letter).toBe('');
      expect(tile.state).toBe('empty');
    });
  });
});

// ── getGameStatus ─────────────────────────────────────────────────────────────

describe('getGameStatus', () => {
  const makeBoard = (guesses: string[], target: string) => {
    const board = buildEmptyBoard();
    guesses.forEach((g, row) => {
      const tiles = evaluateGuess(g, target);
      board[row] = tiles;
    });
    return board;
  };

  it('returns "playing" when game is in progress', () => {
    const board = makeBoard(['crane'], 'spine');
    expect(getGameStatus(board, 1, 'spine')).toBe('playing');
  });

  it('returns "won" when target is guessed correctly', () => {
    const board = makeBoard(['spine'], 'spine');
    expect(getGameStatus(board, 1, 'spine')).toBe('won');
  });

  it('returns "lost" when all guesses exhausted without win', () => {
    const board = makeBoard(['crane','light','stomp','brisk','dwell','fuzzy'], 'spine');
    expect(getGameStatus(board, MAX_GUESSES, 'spine')).toBe('lost');
  });

  it('returns "won" even if win happened on last row', () => {
    const guesses = ['crane','light','stomp','brisk','dwell','spine'];
    const board = makeBoard(guesses, 'spine');
    expect(getGameStatus(board, MAX_GUESSES, 'spine')).toBe('won');
  });
});

// ── getWinMessage ─────────────────────────────────────────────────────────────

describe('getWinMessage', () => {
  it('returns "Genius!" for 1st guess', () => {
    expect(getWinMessage(1)).toBe('Genius!');
  });

  it('returns "Phew!" for 6th guess', () => {
    expect(getWinMessage(6)).toBe('Phew!');
  });

  it('never throws for row values 1–6', () => {
    for (let i = 1; i <= 6; i++) {
      expect(() => getWinMessage(i)).not.toThrow();
    }
  });

  it('returns a non-empty string for all valid rows', () => {
    for (let i = 1; i <= 6; i++) {
      expect(getWinMessage(i).length).toBeGreaterThan(0);
    }
  });

  it('covers all WIN_MESSAGES entries', () => {
    const messages = new Set(Array.from({ length: 6 }, (_, i) => getWinMessage(i + 1)));
    expect(messages.size).toBe(WIN_MESSAGES.length);
  });
});
