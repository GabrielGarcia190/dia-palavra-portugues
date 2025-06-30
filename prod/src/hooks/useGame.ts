
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
    activeGrid,
    setActiveGrid,
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
    activeGrid,
    setActiveGrid,
    MAX_GUESSES,
    WORD_LENGTH,
    gameMode
  );

  const {
    handleKeyPress,
    handleTileClick,
    handleGridClick,
    handleLetterInput,
    handleBackspaceAtPosition,
  } = useKeyboardInput(
    gameStatus,
    currentGuess,
    setCurrentGuess,
    selectedPosition,
    setSelectedPosition,
    activeGrid,
    setActiveGrid,
    targetWords,
    guesses,
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
    activeGrid,
    targetWords,
    handleKeyPress,
    handleTileClick,
    handleGridClick,
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
