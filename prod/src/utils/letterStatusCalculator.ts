
import { LetterStatus } from '@/hooks/useGameState';

export class LetterStatusCalculator {

  static calculateLetterStatuses(guess: string, targetWord: string): LetterStatus[] {
    const guessArray = guess.split('');
    const targetArray = targetWord.split('');
    const result: LetterStatus[] = new Array(guess.length).fill('absent');
    const targetLetterCount: Record<string, number> = {};
    const usedTargetPositions = new Set<number>();

    targetArray.forEach(letter => {
      targetLetterCount[letter] = (targetLetterCount[letter] || 0) + 1;
    });

    guessArray.forEach((letter, index) => {
      if (letter === targetArray[index]) {
        result[index] = 'correct';
        targetLetterCount[letter]--;
        usedTargetPositions.add(index);
      }
    });

    guessArray.forEach((letter, index) => {
      if (result[index] !== 'correct') {
        if (targetLetterCount[letter] > 0) {
          result[index] = 'present';
          targetLetterCount[letter]--;
        }
      }
    });

    return result;
  }

  static getBestLetterStatus(letter: string, position: number, guess: string, targetWords: string[]): LetterStatus {
    let bestStatus: LetterStatus = 'absent';

    for (const targetWord of targetWords) {
      const statuses = this.calculateLetterStatuses(guess, targetWord);
      const currentStatus = statuses[position];

      if (currentStatus === 'correct') {
        return 'correct';
      } else if (currentStatus === 'present') {
        bestStatus = 'present';
      }
    }

    return bestStatus;
  }
}