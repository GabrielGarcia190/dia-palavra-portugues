
interface DailyWordRecord {
  id: number;
  date: string;
  word: string;
  mode: string;
  words: string;
}

export class DailyWordManager {
  private static readonly DB_NAME = 'wordle_daily_words';
  private static readonly DB_VERSION = 1;
  private static db: IDBDatabase | null = null;

  private static async initDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(request.result);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains('daily_words')) {
          const store = db.createObjectStore('daily_words', { keyPath: 'id', autoIncrement: true });
          store.createIndex('date_mode', ['date', 'mode'], { unique: true });
        }
      };
    });
  }

  public static async getDailyWords(date: string, mode: string): Promise<string[] | null> {
    try {
      const db = await this.initDB();
      const transaction = db.transaction(['daily_words'], 'readonly');
      const store = transaction.objectStore('daily_words');
      const index = store.index('date_mode');
      
      return new Promise((resolve, reject) => {
        const request = index.get([date, mode]);
        
        request.onsuccess = () => {
          const result = request.result as DailyWordRecord;
          if (result) {
            resolve(JSON.parse(result.words));
          } else {
            resolve(null);
          }
        };
        
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Erro ao buscar palavras do dia:', error);
      return null;
    }
  }

  public static async saveDailyWords(date: string, mode: string, words: string[]): Promise<void> {
    try {
      const db = await this.initDB();
      const transaction = db.transaction(['daily_words'], 'readwrite');
      const store = transaction.objectStore('daily_words');
      
      const record: Omit<DailyWordRecord, 'id'> = {
        date,
        mode,
        word: words[0], // Manter compatibilidade
        words: JSON.stringify(words)
      };

      return new Promise((resolve, reject) => {
        const request = store.add(record);
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Erro ao salvar palavras do dia:', error);
      throw error;
    }
  }

  public static async clearOldWords(): Promise<void> {
    try {
      const db = await this.initDB();
      const transaction = db.transaction(['daily_words'], 'readwrite');
      const store = transaction.objectStore('daily_words');
      const today = new Date().toDateString();
      
      return new Promise((resolve, reject) => {
        const request = store.openCursor();
        
        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result;
          if (cursor) {
            const record = cursor.value as DailyWordRecord;
            if (record.date !== today) {
              cursor.delete();
            }
            cursor.continue();
          } else {
            resolve();
          }
        };
        
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Erro ao limpar palavras antigas:', error);
    }
  }
}
