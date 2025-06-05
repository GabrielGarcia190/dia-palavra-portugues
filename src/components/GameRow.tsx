
import React from 'react';
import { GameTile } from './GameTile';

interface GameRowProps {
  word: string;
  targetWords: string[];
  isCurrentRow: boolean;
  isSubmitted: boolean;
  rowIndex: number;
  selectedPosition?: number;
  onTileClick?: (position: number) => void;
}

export const GameRow: React.FC<GameRowProps> = ({
  word,
  targetWords,
  isCurrentRow,
  isSubmitted,
  rowIndex,
  selectedPosition,
  onTileClick
}) => {
  return (
    <div className="grid grid-cols-5 gap-2">
      {Array.from({ length: 5 }, (_, index) => {
        const letter = word[index] || '';
        return (
          <GameTile
            key={index}
            letter={letter}
            targetWords={targetWords}
            position={index}
            isCurrentRow={isCurrentRow}
            isSubmitted={isSubmitted}
            tileIndex={index}
            rowIndex={rowIndex}
            isSelected={isCurrentRow && selectedPosition === index}
            onClick={() => isCurrentRow && onTileClick?.(index)}
          />
        );
      })}
    </div>
  );
};
