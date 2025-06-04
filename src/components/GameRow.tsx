
import React from 'react';
import { GameTile } from './GameTile';

interface GameRowProps {
  word: string;
  targetWord: string;
  isCurrentRow: boolean;
  isSubmitted: boolean;
  rowIndex: number;
}

export const GameRow: React.FC<GameRowProps> = ({
  word,
  targetWord,
  isCurrentRow,
  isSubmitted,
  rowIndex
}) => {
  return (
    <div className="grid grid-cols-5 gap-1">
      {Array.from({ length: 5 }, (_, index) => {
        const letter = word[index] || '';
        return (
          <GameTile
            key={index}
            letter={letter}
            targetWord={targetWord}
            position={index}
            isCurrentRow={isCurrentRow}
            isSubmitted={isSubmitted}
            tileIndex={index}
            rowIndex={rowIndex}
          />
        );
      })}
    </div>
  );
};
