
import { IDailyWordRepository } from '../interfaces/IDailyWordRepository';

// Implementação concreta do Repository usando IndexedDB
export class IndexedDBRepository implements IDailyWordRepository {
  private dbName = 'WordleDB';
  private version = 1;
  private storeName = 'dailyWords';

  private async getDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
          store.createIndex('date_mode', ['date', 'mode'], { unique: true });
        }
      };
    });
  }

  async getDailyWords(date: string, mode: string): Promise<string[] | null> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('date_mode');
      
      return new Promise((resolve, reject) => {
        const request = index.get([date, mode]);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const result = request.result;
          if (result) {
            const words = JSON.parse(result.wordsJson) as string[];
            console.log(`Palavras carregadas do IndexedDB para ${mode} em ${date}:`, words);
            resolve(words);
          } else {
            console.log(`Nenhuma palavra encontrada no IndexedDB para ${mode} em ${date}`);
            resolve(null);
          }
        };
      });
    } catch (error) {
      console.error('Erro ao buscar palavras do IndexedDB:', error);
      return null;
    }
  }

  async saveDailyWords(date: string, mode: string, words: string[]): Promise<void> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      const data = {
        id: `${date}_${mode}`,
        date,
        mode,
        wordsJson: JSON.stringify(words),
        word: words[0] // Compatibilidade
      };

      return new Promise((resolve, reject) => {
        const request = store.put(data);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          console.log(`Palavras salvas no IndexedDB para ${mode} em ${date}:`, words);
          resolve();
        };
      });
    } catch (error) {
      console.error('Erro ao salvar palavras no IndexedDB:', error);
      throw error;
    }
  }

  async clearOldWords(): Promise<void> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const today = new Date().toDateString();

      return new Promise((resolve, reject) => {
        const request = store.getAll();
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const allRecords = request.result;
          const deletePromises = allRecords
            .filter(record => record.date !== today)
            .map(record => {
              return new Promise<void>((deleteResolve, deleteReject) => {
                const deleteRequest = store.delete(record.id);
                deleteRequest.onerror = () => deleteReject(deleteRequest.error);
                deleteRequest.onsuccess = () => deleteResolve();
              });
            });

          Promise.all(deletePromises)
            .then(() => {
              console.log('Palavras antigas removidas do IndexedDB');
              resolve();
            })
            .catch(reject);
        };
      });
    } catch (error) {
      console.error('Erro ao limpar palavras antigas do IndexedDB:', error);
    }
  }
}
