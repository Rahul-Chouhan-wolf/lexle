import { AnimatePresence, motion } from 'framer-motion';

interface ToastProps {
  message: string;
}

export default function Toast({ message }: ToastProps) {
  return (
    <div className="h-10 flex items-center justify-center pointer-events-none">
      <AnimatePresence mode="wait">
        {message && (
          <motion.div
            key={message + Date.now()}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="bg-white text-black font-bold text-sm px-5 py-2 rounded-full shadow-lg tracking-wide"
            role="alert"
            aria-live="polite"
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
