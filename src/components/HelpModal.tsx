import { AnimatePresence, motion } from 'framer-motion';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const examples = [
  { word: 'CRANE', states: ['correct','absent','absent','absent','absent'] as const, hint: 'C is in the correct spot' },
  { word: 'LIGHT', states: ['absent','absent','present','absent','absent'] as const, hint: 'G is in the word but wrong spot' },
  { word: 'VAGUE', states: ['absent','absent','absent','absent','absent'] as const, hint: 'None of these letters are in the word' },
];

const STATE_CLASSES = {
  correct: 'bg-correct border-correct',
  present: 'bg-present border-present',
  absent:  'bg-absent  border-absent',
};

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 16 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            className="bg-[#1a1a1c] border border-[#3a3a3c] rounded-2xl p-7 max-w-sm w-[90%] shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-extrabold text-white tracking-widest uppercase">How to Play</h2>
              <button onClick={onClose} className="text-[#818384] hover:text-white transition-colors text-xl leading-none">✕</button>
            </div>

            <p className="text-[#ccc] text-sm mb-5 leading-relaxed">
              Guess the <strong className="text-white">LEXLE</strong> in 6 tries. Each guess must be a valid 5-letter word.
              The colour of the tiles will change to show how close your guess was.
            </p>

            <div className="border-t border-[#3a3a3c] pt-5 flex flex-col gap-6">
              {examples.map(({ word, states, hint }) => (
                <div key={word}>
                  <div className="flex gap-2 mb-2">
                    {word.split('').map((letter, i) => (
                      <div
                        key={i}
                        className={`w-10 h-10 border-2 rounded flex items-center justify-center text-white font-extrabold text-base ${STATE_CLASSES[states[i]]}`}
                      >
                        {letter}
                      </div>
                    ))}
                  </div>
                  <p className="text-[#aaa] text-xs">{hint}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-[#3a3a3c] mt-5 pt-4">
              <p className="text-[#555] text-xs text-center">Click anywhere outside to close</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
