
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
            console.log(`Palavras carregadas do banco para ${mode} em ${date}:`, JSON.parse(result.words));
            resolve(JSON.parse(result.words));
          } else {
            console.log(`Nenhuma palavra encontrada no banco para ${mode} em ${date}`);
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
      
      // Verificar se já existe uma entrada para esta data e modo
      const index = store.index('date_mode');
      const existingRequest = index.get([date, mode]);
      
      return new Promise((resolve, reject) => {
        existingRequest.onsuccess = () => {
          if (existingRequest.result) {
            console.log(`Palavras já existem no banco para ${mode} em ${date}:`, words);
            resolve();
            return;
          }
          
          const record: Omit<DailyWordRecord, 'id'> = {
            date,
            mode,
            word: words[0], // Manter compatibilidade
            words: JSON.stringify(words)
          };

          const addRequest = store.add(record);
          
          addRequest.onsuccess = () => {
            console.log(`Palavras salvas no banco para ${mode} em ${date}:`, words);
            resolve();
          };
          addRequest.onerror = () => reject(addRequest.error);
        };
        
        existingRequest.onerror = () => reject(existingRequest.error);
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
              console.log(`Removendo palavra antiga: ${record.date} - ${record.mode}`);
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
