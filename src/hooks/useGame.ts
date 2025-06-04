import { useState, useEffect, useCallback } from 'react';
import { PORTUGUESE_WORDS } from '../data/words';
import { toast } from '@/hooks/use-toast';

export type GameStatus = 'playing' | 'won' | 'lost';
export type LetterStatus = 'correct' | 'present' | 'absent' | 'unused';

interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: number[];
}

const MAX_GUESSES = 6;
const WORD_LENGTH = 5;

const getInitialStats = (): GameStats => {
  const saved = localStorage.getItem('wordleStats');
  if (saved) {
    return JSON.parse(saved);
  }
  return {
    gamesPlayed: 0,
    gamesWon: 0,
    currentStreak: 0,
    maxStreak: 0,
    guessDistribution: [0, 0, 0, 0, 0, 0]
  };
};

const getTodaysWord = (): string => {
  const today = new Date();
  const dateString = today.toDateString();
  const saved = localStorage.getItem('todaysWordData');
  
  if (saved) {
    const data = JSON.parse(saved);
    if (data.date === dateString) {
      return data.word;
    }
  }
  
  // Generate new word for today
  const randomIndex = Math.floor(Math.random() * PORTUGUESE_WORDS.length);
  const word = PORTUGUESE_WORDS[randomIndex];
  
  localStorage.setItem('todaysWordData', JSON.stringify({
    date: dateString,
    word: word
  }));
  
  return word;
};

export const useGame = () => {
  const [targetWord] = useState(() => getTodaysWord());
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameStatus, setGameStatus] = useState<GameStatus>('playing');
  const [currentRow, setCurrentRow] = useState(0);
  const [letterStatuses, setLetterStatuses] = useState<Record<string, LetterStatus>>({});
  const [stats, setStats] = useState<GameStats>(getInitialStats);
  const [selectedPosition, setSelectedPosition] = useState<number>(0);

  // Load saved game state
  useEffect(() => {
    const today = new Date().toDateString();
    const savedGame = localStorage.getItem('currentGame');
    
    if (savedGame) {
      const gameData = JSON.parse(savedGame);
      if (gameData.date === today) {
        setGuesses(gameData.guesses || []);
        setCurrentGuess(gameData.currentGuess || '');
        setGameStatus(gameData.gameStatus || 'playing');
        setCurrentRow(gameData.currentRow || 0);
        setLetterStatuses(gameData.letterStatuses || {});
      }
    }
  }, []);

  // Save game state
  useEffect(() => {
    const today = new Date().toDateString();
    const gameData = {
      date: today,
      guesses,
      currentGuess,
      gameStatus,
      currentRow,
      letterStatuses
    };
    localStorage.setItem('currentGame', JSON.stringify(gameData));
  }, [guesses, currentGuess, gameStatus, currentRow, letterStatuses]);

  const isValidWord = (word: string): boolean => {
    const normalizedWord = word.toLowerCase();
    console.log('Checking word:', normalizedWord);
    console.log('Available words sample:', PORTUGUESE_WORDS.slice(0, 10));
    
    const isValid = PORTUGUESE_WORDS.includes(normalizedWord);
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
      const status = getLetterStatus(letter, i, word);
      
      // Only update if the new status is "better" than the current one
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
    console.log('Submitting guess:', currentGuess);
    
    if (currentGuess.length !== WORD_LENGTH) {
      toast({
        title: "Palavra incompleta",
        description: "A palavra deve ter 5 letras",
        variant: "destructive"
      });
      return;
    }

    if (!isValidWord(currentGuess)) {
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

    if (currentGuess.toUpperCase() === targetWord.toUpperCase()) {
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

    setCurrentGuess('');
    setCurrentRow(currentRow + 1);
    setSelectedPosition(0);
  }, [currentGuess, guesses, targetWord, currentRow, letterStatuses, stats]);

  const handleKeyPress = useCallback((key: string) => {
    if (gameStatus !== 'playing') return;

    if (key === 'ENTER') {
      submitGuess();
    } else if (key === 'BACKSPACE') {
      if (currentGuess.length > 0) {
        const newGuess = currentGuess.slice(0, -1);
        setCurrentGuess(newGuess);
        setSelectedPosition(Math.max(0, newGuess.length));
      }
    } else if (/^[A-Z]$/.test(key) && currentGuess.length < WORD_LENGTH) {
      setCurrentGuess(prev => prev + key);
      setSelectedPosition(currentGuess.length + 1);
    }
  }, [gameStatus, currentGuess, submitGuess]);

  const handleTileClick = useCallback((position: number) => {
    if (gameStatus !== 'playing') return;
    setSelectedPosition(position);
  }, [gameStatus]);

  const handleLetterInput = useCallback((letter: string) => {
    if (gameStatus !== 'playing') return;
    
    const newGuess = currentGuess.split('');
    newGuess[selectedPosition] = letter;
    
    // Fill empty spaces up to selected position
    for (let i = 0; i < selectedPosition; i++) {
      if (!newGuess[i]) newGuess[i] = ' ';
    }
    
    const updatedGuess = newGuess.join('').replace(/ /g, '');
    setCurrentGuess(updatedGuess);
    
    // Move to next position if not at the end
    if (selectedPosition < WORD_LENGTH - 1) {
      setSelectedPosition(selectedPosition + 1);
    }
  }, [gameStatus, currentGuess, selectedPosition]);

  const handleBackspaceAtPosition = useCallback(() => {
    if (gameStatus !== 'playing') return;
    
    if (selectedPosition < currentGuess.length) {
      // Remove letter at selected position
      const newGuess = currentGuess.split('');
      newGuess.splice(selectedPosition, 1);
      setCurrentGuess(newGuess.join(''));
    } else if (selectedPosition > 0 && currentGuess.length > 0) {
      // Remove last letter and move selection back
      setCurrentGuess(currentGuess.slice(0, -1));
      setSelectedPosition(selectedPosition - 1);
    }
  }, [gameStatus, currentGuess, selectedPosition]);

  const resetGame = () => {
    setGuesses([]);
    setCurrentGuess('');
    setGameStatus('playing');
    setCurrentRow(0);
    setLetterStatuses({});
    setSelectedPosition(0);
    localStorage.removeItem('currentGame');
  };

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
