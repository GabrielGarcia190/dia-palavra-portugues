import { WordLoader } from '@/data/words';
import { useState, useEffect } from 'react';

export type GameStatus = 'playing' | 'won' | 'lost';
export type GameMode = 'normal' | 'double' | 'quadruple';
export type LetterStatus = 'correct' | 'present' | 'absent' | 'unused';

interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: number[];
}

const WORD_LENGTH = 5;

const getMaxGuesses = (mode: GameMode): number => {
  switch (mode) {
    case 'normal': return 6;
    case 'double': return 9;
    case 'quadruple': return 12;
    default: return 6;
  }
};

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

// Generate target word(s) based on game mode
const getTargetWords = async (mode: GameMode): Promise<string[]> => {
  const today = new Date();
  const dateString = today.toDateString();
  const saved = localStorage.getItem('todaysWordData');
  
  if (saved) {
    const data = JSON.parse(saved);
    if (data.date === dateString && data.mode === mode) {
      return data.words;
    }
  }
  
  // Generate new word(s) for today using WordLoader
  const wordsNeeded = mode === 'normal' ? 1 : mode === 'double' ? 2 : 4;
  const words: string[] = [];
  
  try {
    // Make sure all words are unique
    for (let i = 0; i < wordsNeeded; i++) {
      let newWord;
      let attempts = 0;
      const maxAttempts = 50; // Evita loop infinito
      
      do {
        newWord = await WordLoader.getRandomWord();
        newWord = newWord.toUpperCase();
        attempts++;
        
        if (attempts > maxAttempts) {
          // Se não conseguir palavra única, usa uma palavra com sufixo
          newWord = newWord + '_' + i;
          break;
        }
      } while (words.includes(newWord));
      
      words.push(newWord);
    }
    
    localStorage.setItem('todaysWordData', JSON.stringify({
      date: dateString,
      mode: mode,
      words: words
    }));
    
    return words;
  } catch (error) {
    console.error('Erro ao carregar palavras:', error);
    // Fallback: usar palavras padrão em caso de erro
    const fallbackWords = ['TERMO', 'JOGO', 'CASA', 'VIDA'];
    return fallbackWords.slice(0, wordsNeeded);
  }
};

export const useGameState = () => {
  const [gameMode, setGameMode] = useState<GameMode>('normal');
  const [targetWords, setTargetWords] = useState<string[]>([]);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState(' '.repeat(WORD_LENGTH));
  const [gameStatus, setGameStatus] = useState<GameStatus>('playing');
  const [currentRow, setCurrentRow] = useState(0);
  const [letterStatuses, setLetterStatuses] = useState<Record<string, LetterStatus>>({});
  const [stats, setStats] = useState<GameStats>(getInitialStats);
  const [selectedPosition, setSelectedPosition] = useState<number>(0);
  const [MAX_GUESSES, setMaxGuesses] = useState<number>(getMaxGuesses('normal'));
  const [isLoading, setIsLoading] = useState(true);

  // Initialize target words on component mount
  useEffect(() => {
    const initializeWords = async () => {
      setIsLoading(true);
      try {
        const words = await getTargetWords('normal');
        setTargetWords(words);
      } catch (error) {
        console.error('Erro ao inicializar palavras:', error);
        setTargetWords(['TERMO']); // Palavra padrão de fallback
      } finally {
        setIsLoading(false);
      }
    };

    initializeWords();
  }, []);

  // Load saved game state
  useEffect(() => {
    const today = new Date().toDateString();
    const savedGame = localStorage.getItem('currentGame');
    
    if (savedGame) {
      const gameData = JSON.parse(savedGame);
      if (gameData.date === today) {
        setGameMode(gameData.gameMode || 'normal');
        
        // Se temos palavras salvas, use-as, senão carregue novas
        if (gameData.targetWords && gameData.targetWords.length > 0) {
          setTargetWords(gameData.targetWords);
        }
        
        setGuesses(gameData.guesses || []);
        setCurrentGuess(gameData.currentGuess || ' '.repeat(WORD_LENGTH));
        setGameStatus(gameData.gameStatus || 'playing');
        setCurrentRow(gameData.currentRow || 0);
        setLetterStatuses(gameData.letterStatuses || {});
        setMaxGuesses(getMaxGuesses(gameData.gameMode || 'normal'));
      }
    }
  }, []);

  // Save game state
  useEffect(() => {
    if (targetWords.length > 0) { // Só salva se temos palavras carregadas
      const today = new Date().toDateString();
      const gameData = {
        date: today,
        gameMode,
        targetWords,
        guesses,
        currentGuess,
        gameStatus,
        currentRow,
        letterStatuses
      };
      localStorage.setItem('currentGame', JSON.stringify(gameData));
    }
  }, [gameMode, targetWords, guesses, currentGuess, gameStatus, currentRow, letterStatuses]);

  // Change game mode
  const changeGameMode = async (newMode: GameMode) => {
    if (gameMode !== newMode) {
      setIsLoading(true);
      setGameMode(newMode);
      
      try {
        const newWords = await getTargetWords(newMode);
        setTargetWords(newWords);
      } catch (error) {
        console.error('Erro ao carregar novas palavras:', error);
        // Usar palavras padrão baseado no modo
        const fallbackWords = ['TERMO', 'JOGO', 'CASA', 'VIDA'];
        const wordsNeeded = newMode === 'normal' ? 1 : newMode === 'double' ? 2 : 4;
        setTargetWords(fallbackWords.slice(0, wordsNeeded));
      }
      
      setMaxGuesses(getMaxGuesses(newMode));
      
      // Reset the game
      setGuesses([]);
      setCurrentGuess(' '.repeat(WORD_LENGTH));
      setGameStatus('playing');
      setCurrentRow(0);
      setLetterStatuses({});
      setSelectedPosition(0);
      setIsLoading(false);
    }
  };

  return {
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
    changeGameMode,
    isLoading // Novo estado para indicar carregamento
  };
};