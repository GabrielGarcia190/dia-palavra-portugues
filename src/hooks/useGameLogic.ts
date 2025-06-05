
import { useCallback } from 'react';
import { FIVE_LETTER_WORDS } from '../data/words';
import { toast } from '@/hooks/use-toast';
import { GameStatus, LetterStatus, GameMode } from './useGameState';

interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: number[];
}

export const useGameLogic = (
  targetWords: string[],
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
  WORD_LENGTH: number,
  gameMode: GameMode
) => {
  const isValidWord = (word: string): boolean => {
    const cleanWord = word.replace(/\s/g, '').toLowerCase();
    if (cleanWord.length !== WORD_LENGTH) return false;
    return FIVE_LETTER_WORDS.includes(cleanWord);
  };

  const getLetterStatus = (letter: string, position: number, targetWord: string): LetterStatus => {
    if (!letter || letter === ' ') return 'unused';
    
    const targetLetter = targetWord[position];
    
    if (letter === targetLetter) {
      return 'correct';
    }
    
    if (targetWord.includes(letter)) {
      return 'present';
    }
    
    return 'absent';
  };

  const updateLetterStatusesForAllWords = (word: string) => {
    const newStatuses = { ...letterStatuses };
    
    // Check each letter against each target word and take the best status
    for (let i = 0; i < word.length; i++) {
      const letter = word[i];
      if (letter === ' ') continue; // Skip spaces
      
      let bestStatus: LetterStatus = 'absent';
      
      for (const targetWord of targetWords) {
        const status = getLetterStatus(letter, i, targetWord);
        
        // If a letter is correct in any word, mark it as correct
        if (status === 'correct') {
          bestStatus = 'correct';
          break;
        }
        // If a letter is present but not already marked as correct
        else if (status === 'present' && bestStatus !== 'correct') {
          bestStatus = 'present';
        }
      }
      
      // Only update if the new status is better than the current one
      if (!newStatuses[letter] || 
          (newStatuses[letter] === 'absent' && bestStatus !== 'absent') ||
          (newStatuses[letter] === 'present' && bestStatus === 'correct')) {
        newStatuses[letter] = bestStatus;
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
      if (guessCount <= 6) { // Only update distribution for guesses within original range
        newStats.guessDistribution[guessCount - 1]++;
      }
    } else {
      newStats.currentStreak = 0;
    }
    
    setStats(newStats);
    localStorage.setItem('wordleStats', JSON.stringify(newStats));
  };

  const checkGuessAgainstWords = (guess: string): boolean => {
    // Check if the guess matches any of the target words
    const cleanGuess = guess.replace(/\s/g, '').toUpperCase();
    return targetWords.some(word => cleanGuess === word);
  };

  const submitGuess = useCallback(() => {
    const cleanGuess = currentGuess.replace(/\s/g, '');
    
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
    updateLetterStatusesForAllWords(currentGuess);

    if (checkGuessAgainstWords(currentGuess)) {
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
        description: `As palavras eram: ${targetWords.join(', ')}`,
        variant: "destructive"
      });
    }

    setCurrentGuess(' '.repeat(WORD_LENGTH));
    setCurrentRow(currentRow + 1);
    setSelectedPosition(0);
  }, [currentGuess, guesses, targetWords, currentRow, letterStatuses, stats, WORD_LENGTH, MAX_GUESSES]);

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
    updateLetterStatusesForAllWords,
    updateStats
  };
};
