
import { IDailyWordRepository } from '../interfaces/IDailyWordRepository';
import { WordLoader } from '../words';

// Service Layer - Princípio da Responsabilidade Única (SOLID)
export class DailyWordService {
  constructor(private repository: IDailyWordRepository) {}

  async getDailyWords(date: string, mode: string): Promise<string[]> {
    try {
      // Limpar palavras antigas
      await this.repository.clearOldWords();
      
      // Tentar buscar palavras do repositório
      const savedWords = await this.repository.getDailyWords(date, mode);
      if (savedWords && savedWords.length > 0) {
        console.log(`Usando palavras salvas para ${mode}:`, savedWords);
        return savedWords;
      }
      
      // Gerar novas palavras se não existirem
      const words = await this.generateNewWords(mode);
      
      console.log(`Gerando novas palavras para ${mode}:`, words);
      
      // Salvar no repositório
      await this.repository.saveDailyWords(date, mode, words);
      
      return words;
    } catch (error) {
      console.error('Erro ao carregar palavras:', error);
      // Fallback: usar palavras padrão
      return this.getFallbackWords(mode);
    }
  }

  private async generateNewWords(mode: string): Promise<string[]> {
    const wordsNeeded = this.getWordsCount(mode);
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
    
    return words;
  }

  private getWordsCount(mode: string): number {
    switch (mode) {
      case 'normal': return 1;
      case 'double': return 2;
      case 'quadruple': return 4;
      default: return 1;
    }
  }

  private getFallbackWords(mode: string): string[] {
    const fallbackWords = ['TERMO', 'JOGO', 'CASA', 'VIDA'];
    const wordsNeeded = this.getWordsCount(mode);
    return fallbackWords.slice(0, wordsNeeded);
  }

  getNextWordTime(): string {
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const timeDiff = tomorrow.getTime() - now.getTime();
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
}
