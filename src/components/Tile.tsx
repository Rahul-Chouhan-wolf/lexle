import { useEffect, useRef, useState } from 'react';
import { TileData } from '../utils/gameUtils';

interface TileProps {
  data: TileData;
  revealDelay?: number; // ms
  isRevealing?: boolean;
  isBouncing?: boolean;
  bounceDelay?: number;
}

const STATE_CLASSES: Record<TileData['state'], string> = {
  correct: 'bg-correct border-correct text-white',
  present: 'bg-present border-present text-white',
  absent:  'bg-absent  border-absent  text-white',
  tbd:     'bg-transparent border-[#565758] text-white',
  empty:   'bg-transparent border-border   text-white',
};

export default function Tile({ data, revealDelay = 0, isRevealing = false, isBouncing = false, bounceDelay = 0 }: TileProps) {
  const { letter, state } = data;
  const [revealed, setRevealed] = useState(false);
  const [flipping, setFlipping] = useState(false);
  const prevLetterRef = useRef('');

  // Pop animation when a letter is typed
  const [popping, setPopping] = useState(false);
  useEffect(() => {
    if (letter && letter !== prevLetterRef.current && state === 'tbd') {
      setPopping(true);
      const t = setTimeout(() => setPopping(false), 120);
      prevLetterRef.current = letter;
      return () => clearTimeout(t);
    }
    prevLetterRef.current = letter;
  }, [letter, state]);

  // Flip-reveal animation
  useEffect(() => {
    if (!isRevealing) {
      setFlipping(false);
      setRevealed(false);
      return;
    }
    const t1 = setTimeout(() => setFlipping(true), revealDelay);
    const t2 = setTimeout(() => setRevealed(true), revealDelay + 150);
    const t3 = setTimeout(() => setFlipping(false), revealDelay + 300);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [isRevealing, revealDelay]);

  const resolvedState = (isRevealing && revealed) ? state : (isRevealing ? 'tbd' : state);

  const scale = popping ? 'scale-110' : 'scale-100';
  const flipStyle = flipping
    ? { transform: revealed ? 'rotateX(0deg)' : 'rotateX(-90deg)', transition: 'transform 0.15s ease-in-out' }
    : {};

  const bounceStyle = isBouncing
    ? { animationDelay: `${bounceDelay}ms`, animationDuration: '0.5s', animationFillMode: 'both' }
    : {};

  return (
    <div
      className={[
        'w-[62px] h-[62px] border-2 rounded-[4px]',
        'flex items-center justify-center',
        'text-3xl font-extrabold uppercase select-none',
        'transition-transform duration-100',
        STATE_CLASSES[resolvedState],
        scale,
        isBouncing ? 'animate-bounce' : '',
      ].join(' ')}
      style={{ ...flipStyle, ...bounceStyle }}
      aria-label={letter ? `${letter} ${resolvedState}` : 'empty'}
    >
      {letter}
    </div>
  );
}
