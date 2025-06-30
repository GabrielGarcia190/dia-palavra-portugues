
import React from 'react';
import { LetterStatusCalculator } from '@/utils/letterStatusCalculator';
import { cn } from '@/lib/utils';

interface GameTileProps {
  letter: string;
  targetWords: string[];
  position: number;
  isCurrentRow: boolean;
  isSubmitted: boolean;
  tileIndex: number;
  rowIndex: number;
  isSelected?: boolean;
  onClick?: () => void;
  fullWord?: string; // Palavra completa para calcular status correto
}

export const GameTile: React.FC<GameTileProps> = ({
  letter,
  targetWords,
  position,
  isCurrentRow,
  isSubmitted,
  isSelected = false,
  onClick,
  fullWord
}) => {
  const getStatus = () => {
    if (!isSubmitted || !fullWord) return 'empty';
    
    const trimmedLetter = letter.trim();
    if (!trimmedLetter) return 'empty';
    
    if (!targetWords || targetWords.length === 0) return 'empty';

    // Usar o novo calculador de status
    return LetterStatusCalculator.getBestLetterStatus(trimmedLetter, position, fullWord, targetWords);
  };

  const status = getStatus();
  const hasLetter = letter.trim() !== '';

  return (
    <div
      className={cn(
        'w-14 h-14 border-2 rounded-md flex items-center justify-center text-2xl font-bold transition-all duration-300 cursor-pointer',
        {
          // Empty state
          'border-border bg-background': !hasLetter && !isSubmitted,
          
          // Current row with letter
          'border-muted-foreground bg-background scale-105': hasLetter && isCurrentRow && !isSelected,
          
          // Selected state
          'border-primary bg-primary/10 scale-110': isSelected,
          
          // Submitted states
          'border-green-500 bg-green-500 text-white': status === 'correct',
          'border-yellow-500 bg-yellow-500 text-white': status === 'present',
          'border-gray-500 bg-gray-500 text-white': status === 'absent',
        }
      )}
      onClick={onClick}
    >
      <span className="text-foreground">
        {letter.trim().toUpperCase()}
      </span>
    </div>
  );
};
