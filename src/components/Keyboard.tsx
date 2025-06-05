
import React from 'react';
import { Delete } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LetterStatus } from '../hooks/useGame';
import { cn } from '@/lib/utils';

interface KeyboardProps {
  onKeyPress: (key: string) => void;
  onLetterInput: (letter: string) => void;
  onBackspaceAtPosition: () => void;
  letterStatuses: Record<string, LetterStatus>;
  disabled: boolean;
}

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
];

export const Keyboard: React.FC<KeyboardProps> = ({
  onKeyPress,
  onLetterInput,
  onBackspaceAtPosition,
  letterStatuses,
  disabled
}) => {
  const getKeyStatus = (key: string): LetterStatus => {
    return letterStatuses[key] || 'unused';
  };

  const handleKeyClick = (key: string) => {
    if (disabled) return;
    
    if (key === 'ENTER') {
      onKeyPress('ENTER');
    } else if (key === 'BACKSPACE') {
      onBackspaceAtPosition();
    } else {
      onLetterInput(key);
    }
  };

  const getKeyClassName = (key: string) => {
    const status = getKeyStatus(key);
    
    return cn(
      'h-14 font-semibold text-sm transition-all duration-200 rounded-md border-2',
      {
        // Special keys
        'flex-1 min-w-0': key === 'ENTER' || key === 'BACKSPACE',
        'w-10': key !== 'ENTER' && key !== 'BACKSPACE',
        
        // Status colors
        'bg-green-600 hover:bg-green-700 text-white border-green-600': status === 'correct',
        'bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-500': status === 'present',
        'bg-gray-600 hover:bg-gray-700 text-gray-300 border-gray-600 opacity-60': status === 'absent',
        'bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-900 dark:text-white border-gray-300 dark:border-gray-500': status === 'unused',
        
        // Disabled state
        'opacity-30 cursor-not-allowed': disabled,
        'hover:scale-105 active:scale-95': !disabled && status !== 'absent'
      }
    );
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 p-4 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-lg mx-auto space-y-2">
        {KEYBOARD_ROWS.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-1 justify-center">
            {row.map((key) => (
              <Button
                key={key}
                onClick={() => handleKeyClick(key)}
                disabled={disabled}
                variant="outline"
                className={getKeyClassName(key)}
              >
                {key === 'BACKSPACE' ? (
                  <Delete className="h-4 w-4" />
                ) : (
                  key
                )}
              </Button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
