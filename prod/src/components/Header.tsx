
import React from 'react';
import { BarChart3, HelpCircle, Moon, Sun, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onStatsClick: () => void;
  onHelpClick: () => void;
  onToggleDarkMode: () => void;
  onModeClick: () => void;
  darkMode: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onStatsClick,
  onHelpClick,
  onToggleDarkMode,
  onModeClick,
  darkMode
}) => {
  return (
    <header className="border-b border-gray-200 dark:border-gray-700 py-4 mb-4">
      <div className="max-w-lg mx-auto px-4">
        <div className="flex justify-between items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={onHelpClick}
            className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            <HelpCircle className="h-6 w-6" />
          </Button>

          <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white">
            PALAVRA
          </h1>

          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleDarkMode}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              {darkMode ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={onModeClick}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              <Layers className="h-6 w-6" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={onStatsClick}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              <BarChart3 className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};