import { AnimatePresence, motion } from 'framer-motion';
import { GameStatus } from '../utils/gameUtils';

interface GameModalProps {
  status: GameStatus;
  target: string;
  guessCount: number;
  onNext: () => void;
}

export default function GameModal({ status, target, guessCount, onNext }: GameModalProps) {
  const isOpen = status === 'won' || status === 'lost';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={onNext}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            className="bg-[#1a1a1c] border border-[#3a3a3c] rounded-2xl p-8 max-w-sm w-[90%] text-center shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Status icon */}
            <div className="text-5xl mb-4">
              {status === 'won' ? '🎉' : '😔'}
            </div>

            {/* Headline */}
            <h2 className="text-2xl font-extrabold text-white mb-1">
              {status === 'won' ? 'You got it!' : 'Better luck next time'}
            </h2>
            <p className="text-[#818384] text-sm mb-5">
              {status === 'won'
                ? `Solved in ${guessCount} ${guessCount === 1 ? 'guess' : 'guesses'}`
                : 'The word was'}
            </p>

            {/* Word reveal */}
            <div className="flex justify-center gap-2 mb-7">
              {target.toUpperCase().split('').map((letter, i) => (
                <div
                  key={i}
                  className="w-12 h-12 bg-correct rounded-[4px] flex items-center justify-center text-white text-xl font-extrabold"
                >
                  {letter}
                </div>
              ))}
            </div>

            {/* Next Word button */}
            <button
              onClick={onNext}
              className="w-full bg-correct hover:bg-[#6aaf65] active:scale-95 text-white font-bold text-base py-3 rounded-xl transition-all duration-150 tracking-wide uppercase"
            >
              Next Word →
            </button>

            <p className="text-[#555] text-xs mt-4">or press anywhere to continue</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
