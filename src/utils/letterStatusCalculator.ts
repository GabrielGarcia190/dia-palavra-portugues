
import { LetterStatus } from '@/hooks/useGameState';

export class LetterStatusCalculator {
  /**
   * Calcula o status de cada letra considerando duplicatas
   */
  static calculateLetterStatuses(guess: string, targetWord: string): LetterStatus[] {
    const guessArray = guess.split('');
    const targetArray = targetWord.split('');
    const result: LetterStatus[] = new Array(guess.length).fill('absent');
    const targetLetterCount: Record<string, number> = {};
    const usedTargetPositions = new Set<number>();

    // Contar letras na palavra alvo
    targetArray.forEach(letter => {
      targetLetterCount[letter] = (targetLetterCount[letter] || 0) + 1;
    });

    // Primeira passada: marcar letras corretas (verdes)
    guessArray.forEach((letter, index) => {
      if (letter === targetArray[index]) {
        result[index] = 'correct';
        targetLetterCount[letter]--;
        usedTargetPositions.add(index);
      }
    });

    // Segunda passada: marcar letras presentes mas na posição errada (amarelas)
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

  /**
   * Calcula o melhor status para uma letra considerando múltiplas palavras alvo
   */
  static getBestLetterStatus(letter: string, position: number, guess: string, targetWords: string[]): LetterStatus {
    let bestStatus: LetterStatus = 'absent';

    for (const targetWord of targetWords) {
      const statuses = this.calculateLetterStatuses(guess, targetWord);
      const currentStatus = statuses[position];

      // Prioridade: correct > present > absent
      if (currentStatus === 'correct') {
        return 'correct';
      } else if (currentStatus === 'present' && bestStatus !== 'correct') {
        bestStatus = 'present';
      }
    }

    return bestStatus;
  }
}
