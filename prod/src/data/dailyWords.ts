import { IResponseData } from '@/interfaces/IResponceDate';
import { WordOfTheDay } from '@/schemas/get-daily-words-schema';
import axios from 'axios';

export class DailyWordManager {
  public static async getDailyWords(date: string, mode: string): Promise<string[] | null> {

    try {
      const response = await axios.get<WordOfTheDay>(`/api/words/get-daily-words?date=${date}&mode=${mode}`);

      if (!response.data.success)
        return null;

      return response.data.data.words.split(',').map(word => word.trim()).filter(word => word.length > 0);

    } catch (error) {

      console.error('Erro desconhecido:', error);

      return null;
    }
  }

  public static async saveDailyWords(teste: Date, mode: string, words: string[]): Promise<void> {
    try {

      const dateObj = new Date(teste);
      dateObj.setUTCHours(0, 0, 0, 0);

      const date = dateObj.toISOString();

      const response = await axios.post<WordOfTheDay>('/api/words/save-daily-words', {
        date,
        mode,
        words
      });

      console.log(response);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Falha ao salvar palavras');
      }

      console.log(`Palavras salvas com sucesso para ${mode} em ${date}:`, words);

    } catch (error) {
      console.error('Erro ao salvar palavras:', error);
    }
  }

  public static async clearOldWords(): Promise<{ deletedCount: number }> {
    try {
      const response = await axios.delete<IResponseData<{ deletedCount: number }>>(
        '/api/words/clear-old-words',
        {
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Operação não foi bem-sucedida');
      }

      console.log('🗑️ Palavras antigas removidas:', {
        count: response.data.data?.deletedCount,
        time: new Date().toISOString()
      });

      return {
        deletedCount: response.data.data?.deletedCount || 0
      };

    } catch (error) {
      let errorMessage = 'Erro ao limpar palavras antigas';

      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message ||
          error.message ||
          'Erro na comunicação com a API';
        console.error(`❌ Erro ${error.response?.status || 'desconhecido'}:`, errorMessage);
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      throw new Error(errorMessage);
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