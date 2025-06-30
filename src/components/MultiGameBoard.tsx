
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
  activeGrid: number;
  onTileClick: (position: number) => void;
  onGridClick: (gridIndex: number) => void;
  gameMode: GameMode;
  MAX_GUESSES: number;
}

export const MultiGameBoard: React.FC<MultiGameBoardProps> = ({
  guesses,
  currentGuess,
  currentRow,
  targetWords,
  gameStatus,
  selectedPosition,
  activeGrid,
  onTileClick,
  onGridClick,
  gameMode,
  MAX_GUESSES
}) => {
  if (gameMode === 'normal') {
    return (
      <div className="max-w-sm mx-auto mb-8">
        <div className="space-y-2">
          {Array.from({ length: MAX_GUESSES }, (_, rowIndex) => {
            const word = rowIndex < guesses.length 
              ? guesses[rowIndex] 
              : rowIndex === currentRow 
                ? currentGuess 
                : '';
                
            return (
              <GameRow
                key={rowIndex}
                word={word}
                targetWords={targetWords}
                isCurrentRow={rowIndex === currentRow}
                isSubmitted={rowIndex < guesses.length}
                rowIndex={rowIndex}
                selectedPosition={rowIndex === currentRow ? selectedPosition : undefined}
                onTileClick={rowIndex === currentRow ? onTileClick : undefined}
              />
            );
          })}
        </div>
      </div>
    );
  }

  const totalGrids = gameMode === 'double' ? 2 : 4;

  return (
    <div className="w-full max-w-6xl mx-auto mb-8">
      <div className={`grid ${
        gameMode === 'double' 
          ? 'grid-cols-2 gap-8' 
          : 'grid-cols-2 lg:grid-cols-4 gap-3'
      }`}>
        {Array.from({ length: totalGrids }, (_, gridIndex) => (
          <div
            key={gridIndex}
            className="cursor-pointer"
          >
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3 text-center">
              Palavra {gridIndex + 1}
            </h3>
            
            <div className="space-y-2">
              {Array.from({ length: MAX_GUESSES }, (_, rowIndex) => {
                const word = rowIndex < guesses.length 
                  ? guesses[rowIndex] 
                  : rowIndex === currentRow
                    ? currentGuess 
                    : '';
                    
                return (
                  <GameRow
                    key={rowIndex}
                    word={word}
                    targetWords={[targetWords[gridIndex]]}
                    isCurrentRow={rowIndex === currentRow}
                    isSubmitted={rowIndex < guesses.length}
                    rowIndex={rowIndex}
                    selectedPosition={
                      rowIndex === currentRow && gridIndex === activeGrid 
                        ? selectedPosition 
                        : undefined
                    }
                    onTileClick={
                      rowIndex === currentRow 
                        ? (position: number) => {
                            onGridClick(gridIndex);
                            onTileClick(position);
                          }
                        : undefined
                    }
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
