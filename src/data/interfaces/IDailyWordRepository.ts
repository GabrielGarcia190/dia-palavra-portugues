
// Interface Repository Pattern - Princípio da Inversão de Dependência (SOLID)
export interface IDailyWordRepository {
  getDailyWords(date: string, mode: string): Promise<string[] | null>;
  saveDailyWords(date: string, mode: string, words: string[]): Promise<void>;
  clearOldWords(): Promise<void>;
}
