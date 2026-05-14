import { useState } from 'react';
import Board from './components/Board';
import GameModal from './components/GameModal';
import HelpModal from './components/HelpModal';
import Keyboard from './components/Keyboard';
import Toast from './components/Toast';
import { useGame } from './hooks/useGame';

export default function App() {
  const game = useGame();
  const [helpOpen, setHelpOpen] = useState(false);

  const isInputDisabled = game.status !== 'playing' || game.revealingRow !== null;

  return (
    <div className="min-h-screen bg-[#0f0f10] text-white flex flex-col items-center" style={{ fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif" }}>

      {/* Header */}
      <header className="w-full max-w-[500px] flex items-center justify-between px-4 py-3 border-b border-[#3a3a3c]">
        <button
          onClick={() => setHelpOpen(true)}
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#1a1a1c] transition-colors text-[#818384] hover:text-white"
          aria-label="How to play"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
          </svg>
        </button>

        <h1
          className="text-2xl font-extrabold tracking-[0.22em] uppercase"
          style={{
            background: 'linear-gradient(135deg, #fff 30%, #818384 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Lexle
        </h1>

        <button
          onClick={game.reset}
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-correct hover:bg-[#6aaf65] active:scale-95 transition-all text-white"
          aria-label="New word"
          title="New word"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
          </svg>
        </button>
      </header>

      {/* Toast notification */}
      <div className="w-full max-w-[500px] px-4 pt-2">
        <Toast message={game.toast} />
      </div>

      {/* Game board */}
      <main className="flex-1 flex items-center justify-center py-2">
        <Board
          board={game.board}
          currentRow={game.currentRow}
          shakingRow={game.shakingRow}
          revealingRow={game.revealingRow}
          bouncingRow={game.bouncingRow}
        />
      </main>

      {/* On-screen keyboard */}
      <Keyboard
        keyMap={game.keyMap}
        onKey={game.type}
        onEnter={game.submit}
        onBackspace={game.backspace}
        disabled={isInputDisabled}
      />

      {/* Win / Lose modal */}
      <GameModal
        status={game.status}
        target={game.target}
        guessCount={game.currentRow}
        onNext={game.reset}
      />

      {/* Help modal */}
      <HelpModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
}
