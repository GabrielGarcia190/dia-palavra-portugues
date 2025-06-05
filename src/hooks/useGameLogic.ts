
import { useCallback } from 'react';
import { PORTUGUESE_WORDS } from '../data/words';
import { toast } from '@/hooks/use-toast';
import { GameStatus, LetterStatus } from './useGameState';

interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: number[];
}

export const useGameLogic = (
  targetWord: string,
  guesses: string[],
  setGuesses: (guesses: string[]) => void,
  currentGuess: string,
  setCurrentGuess: (guess: string) => void,
  gameStatus: GameStatus,
  setGameStatus: (status: GameStatus) => void,
  currentRow: number,
  setCurrentRow: (row: number) => void,
  letterStatuses: Record<string, LetterStatus>,
  setLetterStatuses: (statuses: Record<string, LetterStatus>) => void,
  stats: GameStats,
  setStats: (stats: GameStats) => void,
  selectedPosition: number,
  setSelectedPosition: (position: number) => void,
  MAX_GUESSES: number,
  WORD_LENGTH: number
) => {
  const isValidWord = (word: string): boolean => {
    const cleanWord = word.replace(/\s/g, '').toLowerCase();
    console.log('Checking word:', cleanWord);
    const isValid = PORTUGUESE_WORDS.includes(cleanWord);
    console.log('Word is valid:', isValid);
    return isValid;
  };

  const getLetterStatus = (letter: string, position: number, word: string): LetterStatus => {
    const targetLetter = targetWord[position];
    
    if (letter === targetLetter) {
      return 'correct';
    }
    
    if (targetWord.includes(letter)) {
      return 'present';
    }
    
    return 'absent';
  };

  const updateLetterStatuses = (word: string) => {
    const newStatuses = { ...letterStatuses };
    
    for (let i = 0; i < word.length; i++) {
      const letter = word[i];
      if (letter === ' ') continue; // Skip spaces
      
      const status = getLetterStatus(letter, i, word);
      
      if (!newStatuses[letter] || 
          (newStatuses[letter] === 'absent' && status !== 'absent') ||
          (newStatuses[letter] === 'present' && status === 'correct')) {
        newStatuses[letter] = status;
      }
    }
    
    setLetterStatuses(newStatuses);
  };

  const updateStats = (won: boolean, guessCount: number) => {
    const newStats = { ...stats };
    newStats.gamesPlayed++;
    
    if (won) {
      newStats.gamesWon++;
      newStats.currentStreak++;
      newStats.maxStreak = Math.max(newStats.maxStreak, newStats.currentStreak);
      newStats.guessDistribution[guessCount - 1]++;
    } else {
      newStats.currentStreak = 0;
    }
    
    setStats(newStats);
    localStorage.setItem('wordleStats', JSON.stringify(newStats));
  };

  const submitGuess = useCallback(() => {
    const cleanGuess = currentGuess.replace(/\s/g, '');
    console.log('Submitting guess:', cleanGuess);
    
    if (cleanGuess.length !== WORD_LENGTH) {
      toast({
        title: "Palavra incompleta",
        description: `A palavra deve ter ${WORD_LENGTH} letras`,
        variant: "destructive"
      });
      return;
    }

    if (!isValidWord(cleanGuess)) {
      toast({
        title: "Palavra inválida",
        description: "Esta palavra não está na nossa lista",
        variant: "destructive"
      });
      return;
    }

    const newGuesses = [...guesses, currentGuess];
    setGuesses(newGuesses);
    updateLetterStatuses(currentGuess);

    if (cleanGuess.toUpperCase() === targetWord.toUpperCase()) {
      setGameStatus('won');
      updateStats(true, newGuesses.length);
      toast({
        title: "Parabéns! 🎉",
        description: `Você acertou em ${newGuesses.length} tentativa${newGuesses.length > 1 ? 's' : ''}!`,
      });
    } else if (newGuesses.length >= MAX_GUESSES) {
      setGameStatus('lost');
      updateStats(false, newGuesses.length);
      toast({
        title: "Fim de jogo! 😔",
        description: `A palavra era: ${targetWord.toUpperCase()}`,
        variant: "destructive"
      });
    }

    setCurrentGuess(' '.repeat(WORD_LENGTH));
    setCurrentRow(currentRow + 1);
    setSelectedPosition(0);
  }, [currentGuess, guesses, targetWord, currentRow, letterStatuses, stats, WORD_LENGTH, MAX_GUESSES]);

  const resetGame = () => {
    setGuesses([]);
    setCurrentGuess(' '.repeat(WORD_LENGTH));
    setGameStatus('playing');
    setCurrentRow(0);
    setLetterStatuses({});
    setSelectedPosition(0);
    localStorage.removeItem('currentGame');
  };

  return {
    submitGuess,
    resetGame,
    isValidWord,
    getLetterStatus,
    updateLetterStatuses,
    updateStats
  };
};
