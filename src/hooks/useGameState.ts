
import { useState, useEffect } from 'react';
import { FIVE_LETTER_WORDS } from '../data/words';

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
const getTargetWords = (mode: GameMode): string[] => {
  const today = new Date();
  const dateString = today.toDateString();
  const saved = localStorage.getItem('todaysWordData');
  
  if (saved) {
    const data = JSON.parse(saved);
    if (data.date === dateString && data.mode === mode) {
      return data.words;
    }
  }
  
  // Generate new word(s) for today
  const wordsNeeded = mode === 'normal' ? 1 : mode === 'double' ? 2 : 4;
  const words: string[] = [];
  
  // Make sure all words are 5 letters and we don't have duplicates
  for (let i = 0; i < wordsNeeded; i++) {
    let newWord;
    do {
      const randomIndex = Math.floor(Math.random() * FIVE_LETTER_WORDS.length);
      newWord = FIVE_LETTER_WORDS[randomIndex].toUpperCase();
    } while (words.includes(newWord));
    
    words.push(newWord);
  }
  
  localStorage.setItem('todaysWordData', JSON.stringify({
    date: dateString,
    mode: mode,
    words: words
  }));
  
  return words;
};

export const useGameState = () => {
  const [gameMode, setGameMode] = useState<GameMode>('normal');
  const [targetWords, setTargetWords] = useState<string[]>(() => getTargetWords('normal'));
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState(' '.repeat(WORD_LENGTH));
  const [gameStatus, setGameStatus] = useState<GameStatus>('playing');
  const [currentRow, setCurrentRow] = useState(0);
  const [letterStatuses, setLetterStatuses] = useState<Record<string, LetterStatus>>({});
  const [stats, setStats] = useState<GameStats>(getInitialStats);
  const [selectedPosition, setSelectedPosition] = useState<number>(0);
  const [MAX_GUESSES, setMaxGuesses] = useState<number>(getMaxGuesses('normal'));

  // Load saved game state
  useEffect(() => {
    const today = new Date().toDateString();
    const savedGame = localStorage.getItem('currentGame');
    
    if (savedGame) {
      const gameData = JSON.parse(savedGame);
      if (gameData.date === today) {
        setGameMode(gameData.gameMode || 'normal');
        setTargetWords(gameData.targetWords || getTargetWords('normal'));
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
  }, [gameMode, targetWords, guesses, currentGuess, gameStatus, currentRow, letterStatuses]);

  // Change game mode
  const changeGameMode = (newMode: GameMode) => {
    if (gameMode !== newMode) {
      setGameMode(newMode);
      setTargetWords(getTargetWords(newMode));
      setMaxGuesses(getMaxGuesses(newMode));
      
      // Reset the game
      setGuesses([]);
      setCurrentGuess(' '.repeat(WORD_LENGTH));
      setGameStatus('playing');
      setCurrentRow(0);
      setLetterStatuses({});
      setSelectedPosition(0);
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
    changeGameMode
  };
};
