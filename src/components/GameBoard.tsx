
import React from 'react';
import { GameRow } from './GameRow';
import { GameStatus, GameMode } from '../hooks/useGame';

interface GameBoardProps {
  guesses: string[];
  currentGuess: string;
  currentRow: number;
  targetWords: string[];
  gameStatus: GameStatus;
  selectedPosition: number;
  onTileClick: (position: number) => void;
  gameMode: GameMode;
  MAX_GUESSES: number;
}

const WORD_LENGTH = 5;

export const GameBoard: React.FC<GameBoardProps> = ({
  guesses,
  currentGuess,
  currentRow,
  targetWords,
  gameStatus,
  selectedPosition,
  onTileClick,
  gameMode,
  MAX_GUESSES
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

  const renderGameModeInfo = () => {
    switch (gameMode) {
      case 'normal':
        return <div className="text-center mb-2 text-gray-600 dark:text-gray-300">Modo Normal</div>;
      case 'double':
        return <div className="text-center mb-2 text-gray-600 dark:text-gray-300">Modo Duplo (2 palavras)</div>;
      case 'quadruple':
        return <div className="text-center mb-2 text-gray-600 dark:text-gray-300">Modo Quádruplo (4 palavras)</div>;
      default:
        return null;
    }
  };

  return (
    <div className="mb-8 max-w-sm mx-auto">
      {renderGameModeInfo()}
      <div className="grid gap-2">
        {rows.map((row, index) => (
          <GameRow
            key={index}
            word={row}
            targetWords={targetWords}
            isCurrentRow={index === currentRow && gameStatus === 'playing'}
            isSubmitted={index < guesses.length}
            rowIndex={index}
            selectedPosition={selectedPosition}
            onTileClick={onTileClick}
          />
        ))}
      </div>
    </div>
  );
};
