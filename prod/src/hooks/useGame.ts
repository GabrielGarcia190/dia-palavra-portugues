
import { useGameState } from './useGameState';
import { useGameLogic } from './useGameLogic';
import { useKeyboardInput } from './useKeyboardInput';

export type { GameStatus, LetterStatus, GameMode } from './useGameState';

export const useGame = () => {
  const {
    targetWords,
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
    WORD_LENGTH,
    gameMode,
    changeGameMode
  } = useGameState();

  const { submitGuess, resetGame } = useGameLogic(
    targetWords,
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
    handleBackspaceAtPosition,
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
    targetWords,
    handleKeyPress,
    handleTileClick,
    handleLetterInput,
    handleBackspaceAtPosition,
    resetGame,
    stats,
    MAX_GUESSES,
    WORD_LENGTH,
    gameMode,
    changeGameMode
  };
};
