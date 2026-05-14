import { KeyMap, KEYBOARD_ROWS } from '../utils/gameUtils';

interface KeyboardProps {
  keyMap: KeyMap;
  onKey: (key: string) => void;
  onEnter: () => void;
  onBackspace: () => void;
  disabled: boolean;
}

const KEY_STATE_CLASSES: Record<string, string> = {
  correct: 'bg-correct text-white',
  present: 'bg-present text-white',
  absent:  'bg-absent  text-[#666]',
};

export default function Keyboard({ keyMap, onKey, onEnter, onBackspace, disabled }: KeyboardProps) {
  const handleKey = (key: string) => {
    if (disabled) return;
    if (key === 'ENTER') { onEnter(); return; }
    if (key === '⌫') { onBackspace(); return; }
    onKey(key);
  };

  return (
    <div className="flex flex-col gap-2 w-full max-w-[500px] px-2 pb-4 select-none" aria-label="Keyboard">
      {KEYBOARD_ROWS.map((row, i) => (
        <div key={i} className="flex justify-center gap-[6px]">
          {row.map(key => {
            const stateClass = keyMap[key] ? KEY_STATE_CLASSES[keyMap[key]] : 'bg-[#818384] text-white';
            const isWide = key === 'ENTER' || key === '⌫';
            return (
              <button
                key={key}
                onClick={() => handleKey(key)}
                disabled={disabled}
                aria-label={key === '⌫' ? 'Backspace' : key}
                className={[
                  'h-[58px] rounded-[6px] font-bold text-sm uppercase',
                  'flex items-center justify-center',
                  'active:scale-95 transition-transform duration-75',
                  'cursor-pointer disabled:opacity-50',
                  isWide ? 'min-w-[65px] px-2 text-xs tracking-wide' : 'flex-1 min-w-[40px] max-w-[43px]',
                  stateClass,
                ].join(' ')}
              >
                {key}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
