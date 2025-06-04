
import React, { useState, useEffect } from 'react';
import { GameBoard } from '../components/GameBoard';
import { Keyboard } from '../components/Keyboard';
import { Header } from '../components/Header';
import { StatsModal } from '../components/StatsModal';
import { HelpModal } from '../components/HelpModal';
import { useGame } from '../hooks/useGame';
import { Toaster } from "@/components/ui/toaster";

const Index = () => {
  const {
    guesses,
    currentGuess,
    gameStatus,
    currentRow,
    letterStatuses,
    selectedPosition,
    targetWord,
    handleKeyPress,
    handleTileClick,
    handleLetterInput,
    handleBackspaceAtPosition,
    resetGame,
    stats
  } = useGame();

  const [showStats, setShowStats] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      
      if (key === 'enter') {
        handleKeyPress('ENTER');
      } else if (key === 'backspace') {
        handleBackspaceAtPosition();
      } else if (/^[a-z]$/.test(key)) {
        handleLetterInput(key.toUpperCase());
      }
    };

    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [handleKeyPress, handleLetterInput, handleBackspaceAtPosition]);

  // Show stats when game ends
  useEffect(() => {
    if (gameStatus !== 'playing') {
      const timer = setTimeout(() => {
        setShowStats(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [gameStatus]);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode ? 'dark bg-gray-800' : 'bg-gray-50'
    }`}>
      <div className="max-w-lg mx-auto px-4">
        <Header 
          onStatsClick={() => setShowStats(true)}
          onHelpClick={() => setShowHelp(true)}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
          darkMode={darkMode}
        />
        
        <main className="pb-20">
          <GameBoard 
            guesses={guesses}
            currentGuess={currentGuess}
            currentRow={currentRow}
            targetWord={targetWord}
            gameStatus={gameStatus}
            selectedPosition={selectedPosition}
            onTileClick={handleTileClick}
          />
          
          <Keyboard 
            onKeyPress={handleKeyPress}
            onLetterInput={handleLetterInput}
            onBackspaceAtPosition={handleBackspaceAtPosition}
            letterStatuses={letterStatuses}
            disabled={gameStatus !== 'playing'}
          />
        </main>

        <StatsModal 
          isOpen={showStats}
          onClose={() => setShowStats(false)}
          stats={stats}
          gameStatus={gameStatus}
          guesses={guesses}
          targetWord={targetWord}
          onPlayAgain={resetGame}
        />

        <HelpModal 
          isOpen={showHelp}
          onClose={() => setShowHelp(false)}
        />
      </div>
      <Toaster />
    </div>
  );
};

export default Index;
