
import React from 'react';
import { MultiGameBoard } from './MultiGameBoard';
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

export const GameBoard: React.FC<GameBoardProps> = (props) => {
  return <MultiGameBoard {...props} />;
};
