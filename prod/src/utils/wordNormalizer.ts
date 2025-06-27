
const accentMap: Record<string, string> = {
  'á': 'a', 'à': 'a', 'ã': 'a', 'â': 'a', 'ä': 'a',
  'é': 'e', 'è': 'e', 'ê': 'e', 'ë': 'e',
  'í': 'i', 'ì': 'i', 'î': 'i', 'ï': 'i',
  'ó': 'o', 'ò': 'o', 'õ': 'o', 'ô': 'o', 'ö': 'o',
  'ú': 'u', 'ù': 'u', 'û': 'u', 'ü': 'u',
  'ç': 'c',
  'ñ': 'n'
};

export class WordNormalizer {

  static removeAccents(word: string): string {
    return word.toLowerCase().split('').map(char => accentMap[char] || char).join('');
  }

  static addAccents(userInput: string, originalWord: string): string {
    const normalizedInput = this.removeAccents(userInput.toLowerCase());
    const normalizedOriginal = this.removeAccents(originalWord.toLowerCase());

    if (normalizedInput !== normalizedOriginal) {
      return userInput;
    }

    const result = userInput.toLowerCase().split('').map((char, index) => {
      const originalChar = originalWord[index];
      const normalizedChar = this.removeAccents(char);
      const normalizedOriginalChar = this.removeAccents(originalChar);

      if (normalizedChar === normalizedOriginalChar) {
        return originalChar;
      }

      return char;
    });

    return result.join('').toUpperCase();
  }

  static areEqual(word1: string, word2: string): boolean {
    return this.removeAccents(word1.toLowerCase()) === this.removeAccents(word2.toLowerCase());
  }
}