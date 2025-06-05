
import { useGameState } from './useGameState';
import { useGameLogic } from './useGameLogic';
import { useKeyboardInput } from './useKeyboardInput';

export type { GameStatus, LetterStatus } from './useGameState';

export const useGame = () => {
  const {
    targetWord,
    guesses,
    setGuesses,
    currentGuess,
    setCurrentGuess,
    gameStatus,
    setGameStatus,
    currentRow,
    setCurrentRow,
    letterStatuses,
    setLetterStatuses,
    stats,
    setStats,
    selectedPosition,
    setSelectedPosition,
    MAX_GUESSES,
    WORD_LENGTH
  } = useGameState();

  const { submitGuess, resetGame } = useGameLogic(
    targetWord,
    guesses,
    setGuesses,
    currentGuess,
    setCurrentGuess,
    gameStatus,
    setGameStatus,
    currentRow,
    setCurrentRow,
    letterStatuses,
    setLetterStatuses,
    stats,
    setStats,
    selectedPosition,
    setSelectedPosition,
    MAX_GUESSES,
    WORD_LENGTH
  );

  const {
    handleKeyPress,
    handleTileClick,
    handleLetterInput,
    handleBackspaceAtPosition
  } = useKeyboardInput(
    gameStatus,
    currentGuess,
    setCurrentGuess,
    selectedPosition,
    setSelectedPosition,
    submitGuess,
    WORD_LENGTH
  );

  return {
    guesses,
    currentGuess,
    gameStatus,
    currentRow,
    letterStatuses,
    selectedPosition,
    targetWord: targetWord.toUpperCase(),
    handleKeyPress,
    handleTileClick,
    handleLetterInput,
    handleBackspaceAtPosition,
    resetGame,
    stats
  };
};
