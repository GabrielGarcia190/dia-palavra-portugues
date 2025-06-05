
import { useCallback } from 'react';
import { GameStatus } from './useGameState';

export const useKeyboardInput = (
  gameStatus: GameStatus,
  currentGuess: string,
  setCurrentGuess: (guess: string) => void,
  selectedPosition: number,
  setSelectedPosition: (position: number) => void,
  submitGuess: () => void,
  WORD_LENGTH: number
) => {
  const handleLetterInput = useCallback((letter: string) => {
    if (gameStatus !== 'playing') return;
    
    // Create array with exact length, filling with spaces if needed
    const newGuess = Array.from({ length: WORD_LENGTH }, (_, i) => 
      i < currentGuess.length ? currentGuess[i] : ' '
    );
    
    // Insert letter at selected position
    newGuess[selectedPosition] = letter;
    
    const updatedGuess = newGuess.join('');
    setCurrentGuess(updatedGuess);
    
    // Move to next empty position or next position if not at the end
    let nextPosition = selectedPosition + 1;
    if (nextPosition < WORD_LENGTH) {
      setSelectedPosition(nextPosition);
    }
  }, [gameStatus, currentGuess, selectedPosition, WORD_LENGTH, setCurrentGuess, setSelectedPosition]);

  const handleBackspaceAtPosition = useCallback(() => {
    if (gameStatus !== 'playing') return;
    
    // Create array with exact length, preserving existing letters
    const newGuess = Array.from({ length: WORD_LENGTH }, (_, i) => 
      i < currentGuess.length ? currentGuess[i] : ' '
    );
    
    // Remove letter at selected position only - don't shift other letters
    newGuess[selectedPosition] = ' ';
    
    const updatedGuess = newGuess.join('');
    setCurrentGuess(updatedGuess);
    
    // Don't move position when deleting
  }, [gameStatus, currentGuess, selectedPosition, WORD_LENGTH, setCurrentGuess]);

  const handleArrowNavigation = useCallback((direction: 'left' | 'right') => {
    if (gameStatus !== 'playing') return;
    
    if (direction === 'left' && selectedPosition > 0) {
      setSelectedPosition(selectedPosition - 1);
    } else if (direction === 'right' && selectedPosition < WORD_LENGTH - 1) {
      setSelectedPosition(selectedPosition + 1);
    }
  }, [gameStatus, selectedPosition, WORD_LENGTH, setSelectedPosition]);

  const handleKeyPress = useCallback((key: string) => {
    if (gameStatus !== 'playing') return;

    if (key === 'ENTER') {
      submitGuess();
    } else if (key === 'BACKSPACE') {
      handleBackspaceAtPosition();
    } else if (key === 'ARROWLEFT') {
      handleArrowNavigation('left');
    } else if (key === 'ARROWRIGHT') {
      handleArrowNavigation('right');
    } else if (/^[A-Z]$/.test(key)) {
      handleLetterInput(key);
    }
  }, [gameStatus, submitGuess, handleBackspaceAtPosition, handleArrowNavigation, handleLetterInput]);

  const handleTileClick = useCallback((position: number) => {
    if (gameStatus !== 'playing') return;
    setSelectedPosition(position);
  }, [gameStatus, setSelectedPosition]);

  return {
    handleKeyPress,
    handleTileClick,
    handleLetterInput,
    handleBackspaceAtPosition,
    handleArrowNavigation
  };
};
