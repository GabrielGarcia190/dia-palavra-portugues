
import { useCallback } from 'react';
import { GameStatus } from './useGameState';
import { WordNormalizer } from '@/utils/wordNormalizer';

export const useKeyboardInput = (
  gameStatus: GameStatus,
  currentGuess: string,
  setCurrentGuess: (guess: string) => void,
  selectedPosition: number,
  setSelectedPosition: (position: number) => void,
  activeGrid: number,
  setActiveGrid: (grid: number) => void,
  targetWords: string[],
  guesses: string[],
  submitGuess: () => void,
  WORD_LENGTH: number
) => {
  const isWordAlreadyGuessed = (wordIndex: number): boolean => {
    const targetWord = targetWords[wordIndex];
    return guesses.some(guess => {
      const cleanGuess = guess.replace(/\s/g, '');
      return WordNormalizer.areEqual(cleanGuess, targetWord);
    });
  };

  const handleLetterInput = useCallback((letter: string) => {
    if (gameStatus !== 'playing') return;
    
    // Verificar se a palavra do grid ativo já foi acertada
    if (isWordAlreadyGuessed(activeGrid)) return;
    
    // Create array with exact length, filling with spaces if needed
    const newGuess = Array.from({ length: WORD_LENGTH }, (_, i) => 
      i < currentGuess.length ? currentGuess[i] : ' '
    );
    
    // Insert letter at selected position
    newGuess[selectedPosition] = letter;
    
    const updatedGuess = newGuess.join('');
    setCurrentGuess(updatedGuess);
    
    // Move to next empty position or next position if not at the end
    if (selectedPosition < WORD_LENGTH - 1) {
      setSelectedPosition(selectedPosition + 1);
    }
  }, [gameStatus, currentGuess, selectedPosition, activeGrid, targetWords, guesses, WORD_LENGTH, setCurrentGuess, setSelectedPosition]);

  const handleBackspaceAtPosition = useCallback(() => {
    if (gameStatus !== 'playing') return;
    
    // Verificar se a palavra do grid ativo já foi acertada
    if (isWordAlreadyGuessed(activeGrid)) return;
    
    // Create array with exact length, preserving existing letters
    const newGuess = Array.from({ length: WORD_LENGTH }, (_, i) => 
      i < currentGuess.length ? currentGuess[i] : ' '
    );
    
    // Check if current position has a letter
    if (newGuess[selectedPosition] !== ' ') {
      // Delete character at the current position
      newGuess[selectedPosition] = ' ';
      setCurrentGuess(newGuess.join(''));
    } else if (selectedPosition > 0) {
      // Move backward and delete character if current position is empty
      setSelectedPosition(selectedPosition - 1);
      newGuess[selectedPosition - 1] = ' ';
      setCurrentGuess(newGuess.join(''));
    }
    
  }, [gameStatus, currentGuess, selectedPosition, activeGrid, targetWords, guesses, WORD_LENGTH, setCurrentGuess, setSelectedPosition]);

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

  const handleGridClick = useCallback((gridIndex: number) => {
    if (gameStatus !== 'playing') return;
    
    // Não permitir selecionar grids de palavras já acertadas
    if (isWordAlreadyGuessed(gridIndex)) return;
    
    setActiveGrid(gridIndex);
    setSelectedPosition(0);
  }, [gameStatus, activeGrid, targetWords, guesses, setActiveGrid, setSelectedPosition]);

  return {
    handleKeyPress,
    handleTileClick,
    handleGridClick,
    handleLetterInput,
    handleBackspaceAtPosition,
    handleArrowNavigation
  };
};
