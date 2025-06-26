
import { DailyWordService } from './services/DailyWordService';
import { IndexedDBRepository } from './repositories/IndexedDBRepository';

// Dependency Injection Container - Inversão de Dependência
class DailyWordContainer {
  private static instance: DailyWordContainer;
  private _service: DailyWordService;

  private constructor() {
    const repository = new IndexedDBRepository();
    this._service = new DailyWordService(repository);
  }

  public static getInstance(): DailyWordContainer {
    if (!DailyWordContainer.instance) {
      DailyWordContainer.instance = new DailyWordContainer();
    }
    return DailyWordContainer.instance;
  }

  public get service(): DailyWordService {
    return this._service;
  }
}

// Facade Pattern - Manter compatibilidade com código existente
export class DailyWordManager {
  private static get service() {
    return DailyWordContainer.getInstance().service;
  }

  public static async getDailyWords(date: string, mode: string): Promise<string[] | null> {
    return await this.service.getDailyWords(date, mode);
  }

  public static async saveDailyWords(date: string, mode: string, words: string[]): Promise<void> {
    // Método mantido por compatibilidade, mas implementação movida para o service
    const repository = new IndexedDBRepository();
    await repository.saveDailyWords(date, mode, words);
  }

  public static async clearOldWords(): Promise<void> {
    const repository = new IndexedDBRepository();
    await repository.clearOldWords();
  }

  public static getNextWordTime(): string {
    return this.service.getNextWordTime();
  }
}
