import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface DailyWordRecord {
  id: number;
  date: string;
  word: string;
  mode: string;
  words: string[];
}

export class DailyWordManager {
  public static async getDailyWords(date: string, mode: string): Promise<string[] | null> {
    try {
      const record = await prisma.dailyWord.findUnique({
        where: {
          date_mode: {
            date,
            mode,
          },
        },
      });

      if (record) {
        const wordsArray = JSON.parse(record.words) as string[];
        console.log(`Palavras carregadas do banco para ${mode} em ${date}:`, wordsArray);
        return wordsArray;
      } else {
        console.log(`Nenhuma palavra encontrada no banco para ${mode} em ${date}`);
        return null;
      }
    } catch (error) {
      console.error('Erro ao buscar palavras do dia:', error);
      return null;
    }
  }

  public static async saveDailyWords(date: string, mode: string, words: string[]): Promise<void> {
    try {
      const wordsString = JSON.stringify(words);
      
      await prisma.dailyWord.upsert({
        where: {
          date_mode: {
            date,
            mode,
          },
        },
        update: {
          words: wordsString,
          word: words[0], // Mantém compatibilidade
        },
        create: {
          date,
          mode,
          words: wordsString,
          word: words[0],
        },
      });
      console.log(`Palavras salvas/atualizadas no banco para ${mode} em ${date}:`, words);
    } catch (error) {
      console.error('Erro ao salvar palavras do dia:', error);
      throw error;
    }
  }

  public static async clearOldWords(): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];
      await prisma.dailyWord.deleteMany({
        where: {
          date: {
            not: today,
          },
        },
      });
      console.log('Palavras antigas removidas do banco');
    } catch (error) {
      console.error('Erro ao limpar palavras antigas:', error);
    }
  }

  public static getNextWordTime(): string {
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