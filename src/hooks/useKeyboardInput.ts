
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
    
    const newGuess = currentGuess.split('');
    
    // Ensure array has enough length
    while (newGuess.length < WORD_LENGTH) {
      newGuess.push('');
    }
    
    // Insert letter at selected position
    newGuess[selectedPosition] = letter;
    
    const updatedGuess = newGuess.join('').slice(0, WORD_LENGTH);
    setCurrentGuess(updatedGuess);
    
    // Move to next position if not at the end
    if (selectedPosition < WORD_LENGTH - 1) {
      setSelectedPosition(selectedPosition + 1);
    }
  }, [gameStatus, currentGuess, selectedPosition, WORD_LENGTH]);

  const handleBackspaceAtPosition = useCallback(() => {
    if (gameStatus !== 'playing') return;
    
    const newGuess = currentGuess.split('');
    
    // Remove letter at selected position
    if (selectedPosition < newGuess.length && newGuess[selectedPosition]) {
      newGuess[selectedPosition] = '';
      setCurrentGuess(newGuess.join('').replace(/\s+$/, '')); // Remove trailing spaces
    } else if (selectedPosition > 0) {
      // Move back and remove previous letter
      const prevPos = selectedPosition - 1;
      if (newGuess[prevPos]) {
        newGuess[prevPos] = '';
        setCurrentGuess(newGuess.join('').replace(/\s+$/, ''));
        setSelectedPosition(prevPos);
      }
    }
  }, [gameStatus, currentGuess, selectedPosition]);

  const handleArrowNavigation = useCallback((direction: 'left' | 'right') => {
    if (gameStatus !== 'playing') return;
    
    if (direction === 'left' && selectedPosition > 0) {
      setSelectedPosition(selectedPosition - 1);
    } else if (direction === 'right' && selectedPosition < WORD_LENGTH - 1) {
      setSelectedPosition(selectedPosition + 1);
    }
  }, [gameStatus, selectedPosition, WORD_LENGTH]);

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
  }, [gameStatus]);

  return {
    handleKeyPress,
    handleTileClick,
    handleLetterInput,
    handleBackspaceAtPosition,
    handleArrowNavigation
  };
};
