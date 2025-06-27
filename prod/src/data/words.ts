
export class WordLoader {
  private static readonly WORD_LENGTH = 5;
  public static readonly FILE_PATH = './palavras.txt';

  public static async getRandomWord(): Promise<string> {
    try {
      const response = await fetch(this.FILE_PATH);
      if (!response.ok) throw new Error('Falha ao carregar palavras');

      const fileContent = await response.text();
      const allWords = fileContent
        .split('\n')
        .map(word => word.trim().toLowerCase())
        .filter(word => word.length === this.WORD_LENGTH);

      if (allWords.length === 0) {
        throw new Error('Nenhuma palavra de 5 letras encontrada no arquivo');
      }

      const randomIndex = Math.floor(Math.random() * allWords.length);
      return allWords[randomIndex];
    } catch (error) {
      throw new Error(`Erro ao carregar palavra: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}