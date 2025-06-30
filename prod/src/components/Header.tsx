
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
    <header className="border-b border-border py-4 mb-4">
      <div className="max-w-lg mx-auto px-4">
        <div className="flex justify-between items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={onHelpClick}
            className="text-muted-foreground hover:text-foreground"
          >
            <HelpCircle className="h-6 w-6" />
          </Button>

          <h1 className="text-3xl font-bold text-center text-foreground">
            PALAVRA
          </h1>

          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleDarkMode}
              className="text-muted-foreground hover:text-foreground"
            >
              {darkMode ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={onModeClick}
              className="text-muted-foreground hover:text-foreground"
            >
              <Layers className="h-6 w-6" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={onStatsClick}
              className="text-muted-foreground hover:text-foreground"
            >
              <BarChart3 className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
