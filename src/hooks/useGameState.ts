
import { useState, useEffect } from 'react';
import { PORTUGUESE_WORDS } from '../data/words';

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

export const useGameState = () => {
  const [targetWord] = useState(() => getTodaysWord());
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState(' '.repeat(WORD_LENGTH));
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
        setCurrentGuess(gameData.currentGuess || ' '.repeat(WORD_LENGTH));
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

  return {
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
  };
};
