
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Share2, Trophy } from 'lucide-react';
import { GameStatus } from '../hooks/useGame';
import { toast } from '@/hooks/use-toast';
import { DailyWordManager } from '../data/dailyWords';

interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: number[];
}

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: GameStats;
  gameStatus: GameStatus;
  guesses: string[];
  targetWord: string;
  onPlayAgain: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({
  isOpen,
  onClose,
  stats,
  gameStatus,
  guesses,
  targetWord,
  onPlayAgain
}) => {
  const [nextWordTime, setNextWordTime] = useState('');

  useEffect(() => {
    if (isOpen) {
      const updateTimer = () => {
        setNextWordTime(DailyWordManager.getNextWordTime());
      };
      
      updateTimer(); // Atualizar imediatamente
      const interval = setInterval(updateTimer, 1000);
      
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const winPercentage = stats.gamesPlayed > 0 
    ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) 
    : 0;

  const generateShareText = () => {
    if (gameStatus === 'playing') return '';
    
    const attempts = gameStatus === 'won' ? guesses.length : 'X';
    let shareText = `PALAVRA ${attempts}/6\n\n`;
    
    guesses.forEach(guess => {
      const row = guess.split('').map((letter, index) => {
        if (letter === targetWord[index]) return '🟩';
        if (targetWord.includes(letter)) return '🟨';
        return '⬜';
      }).join('');
      shareText += row + '\n';
    });
    
    return shareText.trim();
  };

  const handleShare = async () => {
    const shareText = generateShareText();
    
    try {
      if (navigator.share && /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        await navigator.share({
          text: shareText,
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        toast({
          title: "Copiado!",
          description: "Resultado copiado para a área de transferência",
        });
      }
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = shareText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      toast({
        title: "Copiado!",
        description: "Resultado copiado para a área de transferência",
      });
    }
  };

  const maxCount = Math.max(...stats.guessDistribution);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            ESTATÍSTICAS
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Game Result */}
          {gameStatus !== 'playing' && (
            <div className="text-center space-y-2">
              {gameStatus === 'won' ? (
                <div className="flex items-center justify-center gap-2 text-green-600">
                  <Trophy className="h-6 w-6" />
                  <span className="text-lg font-semibold">Parabéns!</span>
                </div>
              ) : (
                <div className="text-red-600">
                  <span className="text-lg font-semibold">Que pena!</span>
                </div>
              )}
              <p className="text-sm text-gray-600 dark:text-gray-400">
                A palavra era: <span className="font-bold text-gray-900 dark:text-white">{targetWord}</span>
              </p>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.gamesPlayed}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Jogadas
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {winPercentage}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                % Vitórias
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.currentStreak}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Sequência
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.maxStreak}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Melhor
              </div>
            </div>
          </div>

          {/* Guess Distribution */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              DISTRIBUIÇÃO DE TENTATIVAS
            </h3>
            <div className="space-y-1">
              {stats.guessDistribution.map((count, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-sm font-medium w-4 text-gray-900 dark:text-white">
                    {index + 1}
                  </span>
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded">
                    <div
                      className="bg-green-500 text-white text-right pr-2 rounded text-sm py-1"
                      style={{
                        width: maxCount > 0 ? `${Math.max((count / maxCount) * 100, count > 0 ? 10 : 0)}%` : '0%'
                      }}
                    >
                      {count > 0 && count}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          {gameStatus !== 'playing' && (
            <div className="flex gap-2">
              <Button
                onClick={handleShare}
                variant="outline"
                className="flex-1"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Compartilhar
              </Button>
              <Button
                onClick={() => {
                  onPlayAgain();
                  onClose();
                }}
                className="flex-1"
              >
                Jogar Novamente
              </Button>
            </div>
          )}

          {/* Next Game Timer */}
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            <p>Próxima palavra em:</p>
            <p className="font-mono text-lg text-gray-900 dark:text-white">
              {nextWordTime}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
