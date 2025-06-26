import { WordLoader } from '@/data/words';
import { DailyWordManager } from '@/data/dailyWords';
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

interface GameModeStats {
  normal: GameStats;
  double: GameStats;
  quadruple: GameStats;
}

interface GameModeState {
  targetWords: string[];
  guesses: string[];
  currentGuess: string;
  gameStatus: GameStatus;
  currentRow: number;
  letterStatuses: Record<string, LetterStatus>;
  selectedPosition: number;
}

const WORD_LENGTH = 5;

const getMaxGuesses = (mode: GameMode): number => {
  switch (mode) {
    case 'normal': return 6;
    case 'double': return 9;
    case 'quadruple': return 10;
    default: return 6;
  }
};

const getInitialGameStats = (): GameStats => ({
  gamesPlayed: 0,
  gamesWon: 0,
  currentStreak: 0,
  maxStreak: 0,
  guessDistribution: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
});

const getInitialStats = (): GameModeStats => {
  const saved = localStorage.getItem('wordleStatsByMode');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      // Garantir que todas as propriedades existam
      return {
        normal: { ...getInitialGameStats(), ...parsed.normal },
        double: { ...getInitialGameStats(), ...parsed.double },
        quadruple: { ...getInitialGameStats(), ...parsed.quadruple }
      };
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  }
  
  return {
    normal: getInitialGameStats(),
    double: getInitialGameStats(),
    quadruple: getInitialGameStats()
  };
};

const getInitialGameState = (): GameModeState => ({
  targetWords: [],
  guesses: [],
  currentGuess: ' '.repeat(WORD_LENGTH),
  gameStatus: 'playing',
  currentRow: 0,
  letterStatuses: {},
  selectedPosition: 0
});

// Generate target word(s) based on game mode using database
const getTargetWords = async (mode: GameMode): Promise<string[]> => {
  const today = new Date();
  const dateString = today.toDateString();
  
  try {
    // Limpar palavras antigas
    await DailyWordManager.clearOldWords();
    
    // Tentar buscar palavras do banco
    const savedWords = await DailyWordManager.getDailyWords(dateString, mode);
    if (savedWords && savedWords.length > 0) {
      console.log(`Usando palavras salvas para ${mode}:`, savedWords);
      return savedWords;
    }
    
    // Gerar novas palavras se não existirem no banco
    const wordsNeeded = mode === 'normal' ? 1 : mode === 'double' ? 2 : 4;
    const words: string[] = [];
    
    // Gerar palavras únicas
    for (let i = 0; i < wordsNeeded; i++) {
      let newWord;
      let attempts = 0;
      const maxAttempts = 50;
      
      do {
        newWord = await WordLoader.getRandomWord();
        newWord = newWord.toUpperCase();
        attempts++;
        
        if (attempts > maxAttempts) {
          newWord = newWord + '_' + i;
          break;
        }
      } while (words.includes(newWord));
      
      words.push(newWord);
    }
    
    console.log(`Gerando novas palavras para ${mode}:`, words);
    
    // Salvar no banco
    await DailyWordManager.saveDailyWords(dateString, mode, words);
    
    return words;
  } catch (error) {
    console.error('Erro ao carregar palavras:', error);
    // Fallback: usar palavras padrão
    const fallbackWords = ['TERMO', 'JOGO', 'CASA', 'VIDA'];
    const wordsNeeded = mode === 'normal' ? 1 : mode === 'double' ? 2 : 4;
    return fallbackWords.slice(0, wordsNeeded);
  }
};

export const useGameState = () => {
  const [gameMode, setGameMode] = useState<GameMode>('normal');
  const [gameStates, setGameStates] = useState<Record<GameMode, GameModeState>>({
    normal: getInitialGameState(),
    double: getInitialGameState(),
    quadruple: getInitialGameState()
  });
  const [statsByMode, setStatsByMode] = useState<GameModeStats>(getInitialStats);
  const [MAX_GUESSES, setMaxGuesses] = useState<number>(getMaxGuesses('normal'));
  const [isLoading, setIsLoading] = useState(true);

  // Get current game state
  const currentGameState = gameStates[gameMode];
  const {
    targetWords,
    guesses,
    currentGuess,
    gameStatus,
    currentRow,
    letterStatuses,
    selectedPosition
  } = currentGameState;

  // Get current mode stats
  const stats = statsByMode[gameMode];

  // Initialize target words for all modes on component mount
  useEffect(() => {
    const initializeAllModes = async () => {
      setIsLoading(true);
      try {
        const today = new Date().toDateString();
        const savedGameStates = localStorage.getItem('allGameStates');
        let loadedStates: Record<GameMode, GameModeState> = {
          normal: getInitialGameState(),
          double: getInitialGameState(),
          quadruple: getInitialGameState()
        };

        // Load saved states if they exist and are from today
        if (savedGameStates) {
          const parsed = JSON.parse(savedGameStates);
          if (parsed.date === today) {
            loadedStates = { ...loadedStates, ...parsed.states };
          }
        }

        // Initialize words for each mode if not loaded
        const modes: GameMode[] = ['normal', 'double', 'quadruple'];
        for (const mode of modes) {
          if (loadedStates[mode].targetWords.length === 0) {
            const words = await getTargetWords(mode);
            loadedStates[mode] = {
              ...loadedStates[mode],
              targetWords: words
            };
          }
        }

        setGameStates(loadedStates);
      } catch (error) {
        console.error('Erro ao inicializar modos:', error);
        // Fallback states
        setGameStates({
          normal: { ...getInitialGameState(), targetWords: ['TERMO'] },
          double: { ...getInitialGameState(), targetWords: ['TERMO', 'JOGO'] },
          quadruple: { ...getInitialGameState(), targetWords: ['TERMO', 'JOGO', 'CASA', 'VIDA'] }
        });
      } finally {
        setIsLoading(false);
      }
    };

    initializeAllModes();
  }, []);

  // Save game states whenever they change
  useEffect(() => {
    if (!isLoading) {
      const today = new Date().toDateString();
      const dataToSave = {
        date: today,
        states: gameStates
      };
      localStorage.setItem('allGameStates', JSON.stringify(dataToSave));
    }
  }, [gameStates, isLoading]);

  // Save stats whenever they change
  useEffect(() => {
    localStorage.setItem('wordleStatsByMode', JSON.stringify(statsByMode));
  }, [statsByMode]);

  // Change game mode
  const changeGameMode = async (newMode: GameMode) => {
    if (gameMode !== newMode) {
      setGameMode(newMode);
      setMaxGuesses(getMaxGuesses(newMode));
      
      // If the new mode doesn't have words yet, load them
      if (gameStates[newMode].targetWords.length === 0) {
        setIsLoading(true);
        try {
          const words = await getTargetWords(newMode);
          setGameStates(prev => ({
            ...prev,
            [newMode]: {
              ...prev[newMode],
              targetWords: words
            }
          }));
        } catch (error) {
          console.error('Erro ao carregar palavras:', error);
        } finally {
          setIsLoading(false);
        }
      }
    }
  };

  // Update current game state
  const updateGameState = (updates: Partial<GameModeState>) => {
    setGameStates(prev => ({
      ...prev,
      [gameMode]: {
        ...prev[gameMode],
        ...updates
      }
    }));
  };

  // Update stats for current mode
  const setStats = (newStats: GameStats) => {
    setStatsByMode(prev => ({
      ...prev,
      [gameMode]: newStats
    }));
  };

  return {
    targetWords,
    guesses,
    setGuesses: (guesses: string[]) => updateGameState({ guesses }),
    currentGuess,
    setCurrentGuess: (currentGuess: string) => updateGameState({ currentGuess }),
    gameStatus,
    setGameStatus: (gameStatus: GameStatus) => updateGameState({ gameStatus }),
    currentRow,
    setCurrentRow: (currentRow: number) => updateGameState({ currentRow }),
    letterStatuses,
    setLetterStatuses: (letterStatuses: Record<string, LetterStatus>) => updateGameState({ letterStatuses }),
    stats,
    setStats,
    selectedPosition,
    setSelectedPosition: (selectedPosition: number) => updateGameState({ selectedPosition }),
    MAX_GUESSES,
    WORD_LENGTH,
    gameMode,
    changeGameMode,
    isLoading
  };
};
