
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
      <div className="grid gap-6" style={{
        gridTemplateColumns: gameMode === 'quadruple' 
          ? 'repeat(2, minmax(0, 1fr))' 
          : 'repeat(2, minmax(0, 1fr))'
      }}>
        {Array.from({ length: totalGrids }, (_, gridIndex) => (
          <div
            key={gridIndex}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 border-2 border-gray-200 dark:border-gray-700 cursor-pointer transition-colors"
            onClick={() => onGridClick(gridIndex)}
          >
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3 text-center">
              Palavra {gridIndex + 1}
            </h3>
            
            <div className="space-y-2">
              {Array.from({ length: MAX_GUESSES }, (_, rowIndex) => {
                const word = rowIndex < guesses.length 
                  ? guesses[rowIndex] 
                  : rowIndex === currentRow && gridIndex === activeGrid
                    ? currentGuess 
                    : '';
                    
                return (
                  <GameRow
                    key={rowIndex}
                    word={word}
                    targetWords={[targetWords[gridIndex]]}
                    isCurrentRow={rowIndex === currentRow && gridIndex === activeGrid}
                    isSubmitted={rowIndex < guesses.length}
                    rowIndex={rowIndex}
                    selectedPosition={
                      rowIndex === currentRow && gridIndex === activeGrid 
                        ? selectedPosition 
                        : undefined
                    }
                    onTileClick={
                      rowIndex === currentRow && gridIndex === activeGrid 
                        ? onTileClick 
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
