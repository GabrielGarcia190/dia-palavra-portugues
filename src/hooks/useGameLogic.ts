import { useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { GameStatus, LetterStatus, GameMode } from './useGameState';
import { WordLoader } from '@/data/words';
import { WordNormalizer } from '@/utils/wordNormalizer';
import { LetterStatusCalculator } from '@/utils/letterStatusCalculator';

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
  const isValidWord = async (word: string): Promise<boolean> => {
    const cleanWord = WordNormalizer.removeAccents(word.replace(/\s/g, '')).toLowerCase();
    if (cleanWord.length !== WORD_LENGTH) return false;

    try {
      const response = await fetch(WordLoader.FILE_PATH);
      const words = (await response.text())
        .split('\n')
        .map(w => WordNormalizer.removeAccents(w.trim()).toLowerCase());

      return words.includes(cleanWord);
    } catch (error) {
      console.error('Erro ao verificar palavra:', error);
      return false;
    }
  };

  const updateLetterStatusesForAllWords = (word: string) => {
    const newStatuses = { ...letterStatuses };

    for (let i = 0; i < word.length; i++) {
      const letter = word[i];
      if (letter === ' ') continue;

      // Usar o novo calculador de status
      const bestStatus = LetterStatusCalculator.getBestLetterStatus(letter, i, word, targetWords);

      const currentStatus = newStatuses[letter];
      if (!currentStatus || currentStatus === 'unused' ||
        (currentStatus === 'absent' && (bestStatus === 'present' || bestStatus === 'correct')) ||
        (currentStatus === 'present' && bestStatus === 'correct')) {
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
      if (guessCount <= 6) {
        newStats.guessDistribution[guessCount - 1]++;
      }
    } else {
      newStats.currentStreak = 0;
    }

    setStats(newStats);
    localStorage.setItem('wordleStats', JSON.stringify(newStats));
  };

  const isGuessMatchingAnyWord = (guess: string): boolean => {
    const cleanGuess = guess.replace(/\s/g, '');
    return targetWords.some(targetWord => 
      WordNormalizer.areEqual(cleanGuess, targetWord)
    );
  };

  const areAllWordsGuessed = (allGuesses: string[]): boolean => {
    return targetWords.every(targetWord => 
      allGuesses.some(guess => {
        const cleanGuess = guess.replace(/\s/g, '');
        return WordNormalizer.areEqual(cleanGuess, targetWord);
      })
    );
  };

  const addAccentsToGuess = (guess: string): string => {
    const cleanGuess = guess.replace(/\s/g, '');
    
    // Tentar encontrar uma palavra alvo que corresponda (ignorando acentos)
    for (const targetWord of targetWords) {
      if (WordNormalizer.areEqual(cleanGuess, targetWord)) {
        // Usar a função corrigida para adicionar acentos
        return WordNormalizer.addAccents(cleanGuess, targetWord);
      }
    }
    
    // Se não encontrar correspondência, retorna a palavra em maiúscula
    return cleanGuess.toUpperCase();
  };

  const submitGuess = useCallback(async () => {
    const cleanGuess = currentGuess.replace(/\s/g, '');

    if (cleanGuess.length !== WORD_LENGTH) {
      toast({
        title: "Palavra incompleta",
        description: `A palavra deve ter ${WORD_LENGTH} letras`,
        variant: "destructive"
      });
      return;
    }

    const valid = await isValidWord(cleanGuess);
    if (!valid) {
      toast({
        title: "Palavra inválida",
        description: "Esta palavra não está na nossa lista",
        variant: "destructive"
      });
      return;
    }

    // Adicionar acentos automaticamente se necessário
    const finalGuess = addAccentsToGuess(cleanGuess);
    const paddedGuess = finalGuess.padEnd(WORD_LENGTH, ' ');

    const newGuesses = [...guesses, paddedGuess];
    setGuesses(newGuesses);
    updateLetterStatusesForAllWords(paddedGuess);

    const matchedCurrentGuess = isGuessMatchingAnyWord(paddedGuess);
    const allWordsGuessed = areAllWordsGuessed(newGuesses);

    if (allWordsGuessed) {
      setGameStatus('won');
      updateStats(true, newGuesses.length);
      const wordsCount = targetWords.length;
      const wordText = wordsCount === 1 ? 'palavra' : 'palavras';
      toast({
        title: "Parabéns! 🎉",
        description: `Você acertou ${wordsCount === 1 ? 'a' : 'as'} ${wordsCount} ${wordText} em ${newGuesses.length} tentativa${newGuesses.length > 1 ? 's' : ''}!`,
      });
    } else if (newGuesses.length >= MAX_GUESSES) {
      setGameStatus('lost');
      updateStats(false, newGuesses.length);
      toast({
        title: "Fim de jogo! 😔",
        description: `As palavras eram: ${targetWords.join(', ')}`,
        variant: "destructive"
      });
    } else if (matchedCurrentGuess) {
      const wordsLeft = targetWords.length - newGuesses.filter(guess => 
        targetWords.some(word => WordNormalizer.areEqual(guess.replace(/\s/g, ''), word))
      ).length;
      
      if (wordsLeft > 0) {
        toast({
          title: "Boa! ✅",
          description: `Você acertou uma palavra! Ainda ${wordsLeft === 1 ? 'falta' : 'faltam'} ${wordsLeft} palavra${wordsLeft > 1 ? 's' : ''}.`,
        });
      }
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
    updateLetterStatusesForAllWords,
    updateStats
  };
};
