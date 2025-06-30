
'use client';

import React, { useState, useEffect } from 'react';
import { GameBoard } from '../components/GameBoard';
import { Keyboard } from '../components/Keyboard';
import { Header } from '../components/Header';
import { StatsModal } from '../components/StatsModal';
import { HelpModal } from '../components/HelpModal';
import { useGame, GameMode } from '../hooks/useGame';
import { Toaster } from "@/components/ui/toaster";
import { Button } from '@/components/ui/button';

export default function Home() {
   const {
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
    gameMode,
    changeGameMode
  } = useGame();

  const [showStats, setShowStats] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showModeSelector, setShowModeSelector] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) {
      setDarkMode(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      document.documentElement.classList.toggle('dark', darkMode);
      localStorage.setItem('darkMode', JSON.stringify(darkMode));
    }
  }, [darkMode, isMounted]);

  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      
      if (key === 'enter') {
        handleKeyPress('ENTER');
      } else if (key === 'backspace' || key === 'delete') {
        handleBackspaceAtPosition();
      } else if (key === 'arrowleft') {
        handleKeyPress('ARROWLEFT');
      } else if (key === 'arrowright') {
        handleKeyPress('ARROWRIGHT');
      } else if (/^[a-z]$/.test(key)) {
        handleLetterInput(key.toUpperCase());
      }
    };

    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [handleKeyPress, handleLetterInput, handleBackspaceAtPosition]);

  useEffect(() => {
    if (gameStatus !== 'playing') {
      const timer = setTimeout(() => {
        setShowStats(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [gameStatus]);

  const handleModeChange = (mode: GameMode) => {
    changeGameMode(mode);
    setShowModeSelector(false);
  };

  return (
 <div className={`min-h-screen transition-colors duration-300 ${
      // 4. Aplica dark mode apenas após montagem para evitar mismatch
      isMounted && darkMode ? 'dark bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className={`${gameMode === 'normal' ? 'max-w-lg' : 'max-w-full'} mx-auto px-4`}>
        <Header 
          onStatsClick={() => setShowStats(true)}
          onHelpClick={() => setShowHelp(true)}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
          onModeClick={() => setShowModeSelector(true)}
          darkMode={darkMode}
        />
        
        {showModeSelector && (
          <div className="mb-6 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-md max-w-lg mx-auto">
            <h3 className="text-lg font-medium mb-3 text-center text-gray-900 dark:text-white">
              Escolha um modo de jogo
            </h3>
            <div className="flex flex-col gap-3">
              <Button 
                variant={gameMode === 'normal' ? 'default' : 'outline'} 
                onClick={() => handleModeChange('normal')}
                className="w-full"
              >
                Normal (1 palavra - 6 tentativas)
              </Button>
              <Button 
                variant={gameMode === 'double' ? 'default' : 'outline'} 
                onClick={() => handleModeChange('double')}
                className="w-full"
              >
                Duplo (2 palavras - 9 tentativas)
              </Button>
              <Button 
                variant={gameMode === 'quadruple' ? 'default' : 'outline'} 
                onClick={() => handleModeChange('quadruple')}
                className="w-full"
              >
                Quádruplo (4 palavras - 10 tentativas)
              </Button>
            </div>
          </div>
        )}
        
        <main className="pb-20">
          <GameBoard 
            guesses={guesses}
            currentGuess={currentGuess}
            currentRow={currentRow}
            targetWords={targetWords}
            gameStatus={gameStatus}
            selectedPosition={selectedPosition}
            activeGrid={activeGrid}
            onTileClick={handleTileClick}
            onGridClick={handleGridClick}
            gameMode={gameMode}
            MAX_GUESSES={MAX_GUESSES}
          />
          
          <div className={`${gameMode === 'normal' ? '' : 'max-w-lg mx-auto'}`}>
            <Keyboard 
              onKeyPress={handleKeyPress}
              onLetterInput={handleLetterInput}
              onBackspaceAtPosition={handleBackspaceAtPosition}
              letterStatuses={letterStatuses}
              disabled={gameStatus !== 'playing'}
            />
          </div>
        </main>

        <StatsModal 
          isOpen={showStats}
          onClose={() => setShowStats(false)}
          stats={stats}
          gameStatus={gameStatus}
          guesses={guesses}
          targetWord={targetWords.join(', ')}
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