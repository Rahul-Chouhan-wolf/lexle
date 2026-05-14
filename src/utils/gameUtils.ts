export type LetterState = 'correct' | 'present' | 'absent' | 'empty' | 'tbd';

export interface TileData {
  letter: string;
  state: LetterState;
}

export type KeyMap = Record<string, Exclude<LetterState, 'empty' | 'tbd'>>;

export const WORD_LENGTH = 5;
export const MAX_GUESSES = 6;

export const KEYBOARD_ROWS = [
  ['Q','W','E','R','T','Y','U','I','O','P'],
  ['A','S','D','F','G','H','J','K','L'],
  ['ENTER','Z','X','C','V','B','N','M','⌫'],
];

/**
 * Evaluate a guess against the target word.
 * Uses two-pass algorithm to correctly handle duplicate letters.
 */
export function evaluateGuess(guess: string, target: string): TileData[] {
  const g = guess.toUpperCase().split('');
  const t = target.toUpperCase().split('');
  const result: TileData[] = g.map(letter => ({ letter, state: 'absent' as LetterState }));
  const remaining = [...t];

  // Pass 1: mark correct positions
  g.forEach((letter, i) => {
    if (letter === remaining[i]) {
      result[i].state = 'correct';
      remaining[i] = '';
    }
  });

  // Pass 2: mark present (wrong position)
  g.forEach((letter, i) => {
    if (result[i].state === 'correct') return;
    const idx = remaining.indexOf(letter);
    if (idx !== -1) {
      result[i].state = 'present';
      remaining[idx] = '';
    }
  });

  return result;
}

/**
 * Merge a new guess's results into the existing keyboard colour map.
 * States rank: correct > present > absent (never downgrade a key).
 */
export function mergeKeyMap(keyMap: KeyMap, tiles: TileData[]): KeyMap {
  const rank: Record<Exclude<LetterState, 'empty' | 'tbd'>, number> = {
    correct: 3, present: 2, absent: 1,
  };
  const next = { ...keyMap };
  tiles.forEach(({ letter, state }) => {
    if (state === 'empty' || state === 'tbd') return;
    const current = next[letter.toUpperCase()];
    if (!current || rank[state] > rank[current]) {
      next[letter.toUpperCase()] = state;
    }
  });
  return next;
}

export function buildEmptyBoard(): TileData[][] {
  return Array.from({ length: MAX_GUESSES }, () =>
    Array.from({ length: WORD_LENGTH }, () => ({ letter: '', state: 'empty' as LetterState }))
  );
}

export type GameStatus = 'playing' | 'won' | 'lost';

export function getGameStatus(
  guesses: TileData[][],
  currentRow: number,
  target: string
): GameStatus {
  for (let r = 0; r < currentRow; r++) {
    const word = guesses[r].map(t => t.letter).join('').toLowerCase();
    if (word === target.toLowerCase()) return 'won';
  }
  if (currentRow >= MAX_GUESSES) return 'lost';
  return 'playing';
}

export const WIN_MESSAGES = [
  'Genius!', 'Magnificent!', 'Impressive!',
  'Splendid!', 'Great!', 'Phew!',
];

export function getWinMessage(row: number): string {
  return WIN_MESSAGES[Math.min(row - 1, WIN_MESSAGES.length - 1)];
}
