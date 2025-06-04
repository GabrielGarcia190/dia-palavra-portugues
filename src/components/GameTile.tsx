
import React from 'react';
import { cn } from '@/lib/utils';

interface GameTileProps {
  letter: string;
  targetWord: string;
  position: number;
  isCurrentRow: boolean;
  isSubmitted: boolean;
  tileIndex: number;
  rowIndex: number;
}

export const GameTile: React.FC<GameTileProps> = ({
  letter,
  targetWord,
  position,
  isCurrentRow,
  isSubmitted,
  tileIndex,
  rowIndex
}) => {
  const getStatus = () => {
    if (!isSubmitted) return 'empty';
    
    const trimmedLetter = letter.trim();
    if (!trimmedLetter) return 'empty';
    
    if (trimmedLetter === targetWord[position]) {
      return 'correct';
    }
    
    if (targetWord.includes(trimmedLetter)) {
      return 'present';
    }
    
    return 'absent';
  };

  const status = getStatus();
  const hasLetter = letter.trim() !== '';

  return (
    <div
      className={cn(
        'w-14 h-14 border-2 flex items-center justify-center text-2xl font-bold transition-all duration-300',
        {
          // Empty state
          'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800': !hasLetter && !isSubmitted,
          
          // Current row with letter
          'border-gray-400 dark:border-gray-500 bg-white dark:bg-gray-800 scale-105': hasLetter && isCurrentRow,
          
          // Submitted states
          'border-green-500 bg-green-500 text-white animate-pulse': status === 'correct',
          'border-yellow-500 bg-yellow-500 text-white': status === 'present',
          'border-gray-500 bg-gray-500 text-white': status === 'absent',
          
          // Animation delays for reveal effect
          'animation-delay-0': tileIndex === 0,
          'animation-delay-75': tileIndex === 1,
          'animation-delay-150': tileIndex === 2,
          'animation-delay-300': tileIndex === 3,
          'animation-delay-500': tileIndex === 4,
        }
      )}
      style={{
        animationDelay: isSubmitted ? `${tileIndex * 100}ms` : '0ms'
      }}
    >
      <span className="text-gray-900 dark:text-white">
        {letter.trim().toUpperCase()}
      </span>
    </div>
  );
};
