
import React from 'react';
import { GameRow } from './GameRow';
import { GameStatus } from '../hooks/useGame';

interface GameBoardProps {
  guesses: string[];
  currentGuess: string;
  currentRow: number;
  targetWord: string;
  gameStatus: GameStatus;
  selectedPosition: number;
  onTileClick: (position: number) => void;
}

const MAX_GUESSES = 6;
const WORD_LENGTH = 5; // Corrigido para 5 letras

export const GameBoard: React.FC<GameBoardProps> = ({
  guesses,
  currentGuess,
  currentRow,
  targetWord,
  gameStatus,
  selectedPosition,
  onTileClick
}) => {
  const rows = Array.from({ length: MAX_GUESSES }, (_, index) => {
    if (index < guesses.length) {
      // Ensure submitted guesses are exactly WORD_LENGTH characters
      const guess = guesses[index];
      return guess.length >= WORD_LENGTH ? guess.slice(0, WORD_LENGTH) : guess.padEnd(WORD_LENGTH, ' ');
    } else if (index === currentRow && gameStatus === 'playing') {
      // Ensure current guess is exactly WORD_LENGTH characters
      return currentGuess.length >= WORD_LENGTH ? currentGuess.slice(0, WORD_LENGTH) : currentGuess.padEnd(WORD_LENGTH, ' ');
    } else {
      return ' '.repeat(WORD_LENGTH);
    }
  });

  return (
    <div className="grid gap-2 mb-8 max-w-sm mx-auto">
      {rows.map((row, index) => (
        <GameRow
          key={index}
          word={row}
          targetWord={targetWord}
          isCurrentRow={index === currentRow && gameStatus === 'playing'}
          isSubmitted={index < guesses.length}
          rowIndex={index}
          selectedPosition={selectedPosition}
          onTileClick={onTileClick}
        />
      ))}
    </div>
  );
};
