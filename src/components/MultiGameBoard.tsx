
import React from 'react';
import { GameRow } from './GameRow';
import { GameStatus, GameMode } from '../hooks/useGame';

interface MultiGameBoardProps {
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

export const MultiGameBoard: React.FC<MultiGameBoardProps> = ({
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
      const guess = guesses[index];
      return guess.length >= WORD_LENGTH ? guess.slice(0, WORD_LENGTH) : guess.padEnd(WORD_LENGTH, ' ');
    } else if (index === currentRow && gameStatus === 'playing') {
      return currentGuess.length >= WORD_LENGTH ? currentGuess.slice(0, WORD_LENGTH) : currentGuess.padEnd(WORD_LENGTH, ' ');
    } else {
      return ' '.repeat(WORD_LENGTH);
    }
  });

  const renderGameModeInfo = () => {
    switch (gameMode) {
      case 'normal':
        return <div className="text-center mb-4 text-gray-600 dark:text-gray-300">Modo Normal</div>;
      case 'double':
        return (
          <div className="text-center mb-4 text-gray-600 dark:text-gray-300">
            Modo Duplo - Duas palavras simultaneamente
          </div>
        );
      case 'quadruple':
        return (
          <div className="text-center mb-4 text-gray-600 dark:text-gray-300">
            Modo Quádruplo - Quatro palavras simultaneamente
          </div>
        );
      default:
        return null;
    }
  };

  const renderGrids = () => {
    if (gameMode === 'normal') {
      return (
        <div className="max-w-sm mx-auto">
          <div className="grid gap-2">
            {rows.map((row, index) => (
              <GameRow
                key={index}
                word={row}
                targetWords={[targetWords[0]]}
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
    }

    const gridCount = gameMode === 'double' ? 2 : 4;
    
    return (
      <div className="w-full max-w-none mx-auto px-4">
        <div className={`grid gap-8 ${
          gameMode === 'double' 
            ? 'grid-cols-1 sm:grid-cols-2' 
            : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
        }`}>
          {Array.from({ length: gridCount }, (_, gridIndex) => (
            <div key={gridIndex} className="flex flex-col items-center">
              <div className="space-y-2">
                {rows.map((row, rowIndex) => (
                  <GameRow
                    key={`${gridIndex}-${rowIndex}`}
                    word={row}
                    targetWords={[targetWords[gridIndex]]}
                    isCurrentRow={rowIndex === currentRow && gameStatus === 'playing'}
                    isSubmitted={rowIndex < guesses.length}
                    rowIndex={rowIndex}
                    selectedPosition={gridIndex === 0 ? selectedPosition : undefined}
                    onTileClick={gridIndex === 0 ? onTileClick : undefined}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="mb-8">
      {renderGameModeInfo()}
      {renderGrids()}
    </div>
  );
};
