import { TileData, WORD_LENGTH } from '../utils/gameUtils';
import Tile from './Tile';

interface BoardProps {
  board: TileData[][];
  currentRow: number;
  shakingRow: number | null;
  revealingRow: number | null;
  bouncingRow: number | null;
}

export default function Board({ board, currentRow, shakingRow, revealingRow, bouncingRow }: BoardProps) {
  return (
    <div
      className="flex flex-col gap-[6px]"
      role="grid"
      aria-label="Game board"
    >
      {board.map((row, r) => (
        <div
          key={r}
          className={[
            'flex gap-[6px]',
            shakingRow === r ? 'animate-shake' : '',
          ].join(' ')}
          role="row"
        >
          {row.map((tile, c) => (
            <Tile
              key={c}
              data={tile}
              revealDelay={c * 300}
              isRevealing={revealingRow === r}
              isBouncing={bouncingRow === r}
              bounceDelay={c * 80}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
