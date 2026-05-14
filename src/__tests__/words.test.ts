import { describe, it, expect, beforeEach } from 'vitest';
import { ANSWER_WORDS, VALID_WORDS, getRandomWord, isValidWord } from '../data/words';

describe('word list', () => {
  it('every answer word is exactly 5 letters', () => {
    ANSWER_WORDS.forEach(w => {
      expect(w.length, `"${w}" is not 5 letters`).toBe(5);
    });
  });

  it('every answer word is lowercase', () => {
    ANSWER_WORDS.forEach(w => {
      expect(w, `"${w}" contains uppercase`).toBe(w.toLowerCase());
    });
  });

  it('answer words list is non-empty', () => {
    expect(ANSWER_WORDS.length).toBeGreaterThan(50);
  });

  it('every answer word is also in the valid-words set', () => {
    ANSWER_WORDS.forEach(w => {
      expect(VALID_WORDS.has(w), `"${w}" not in VALID_WORDS`).toBe(true);
    });
  });

  it('answer words have no duplicates', () => {
    const set = new Set(ANSWER_WORDS);
    expect(set.size).toBe(ANSWER_WORDS.length);
  });
});

describe('isValidWord', () => {
  it('returns true for a known answer word', () => {
    expect(isValidWord('crane')).toBe(true);
  });

  it('is case-insensitive', () => {
    expect(isValidWord('CRANE')).toBe(true);
    expect(isValidWord('Crane')).toBe(true);
  });

  it('returns false for a nonsense string', () => {
    expect(isValidWord('zzzzq')).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(isValidWord('')).toBe(false);
  });

  it('returns false for 4-letter words', () => {
    expect(isValidWord('blue')).toBe(false);
  });
});

describe('getRandomWord', () => {
  it('returns a 5-letter string', () => {
    expect(getRandomWord().length).toBe(5);
  });

  it('returns words from ANSWER_WORDS', () => {
    for (let i = 0; i < 20; i++) {
      expect(ANSWER_WORDS).toContain(getRandomWord());
    }
  });

  it('returns different words across multiple calls (probabilistic)', () => {
    const words = new Set(Array.from({ length: 30 }, getRandomWord));
    expect(words.size).toBeGreaterThan(5);
  });
});
