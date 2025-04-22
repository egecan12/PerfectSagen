export interface VocabularyItem {
  id: number;
  word: string;
  translation: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
}

export const vocabulary: VocabularyItem[] = [
  { id: 1, word: 'Hallo', translation: 'Hello', level: 'A1' },
  { id: 2, word: 'Danke', translation: 'Thank you', level: 'A1' },
  { id: 3, word: 'Bitte', translation: 'Please / You\'re welcome', level: 'A1' },
  { id: 4, word: 'Ja', translation: 'Yes', level: 'A1' },
  { id: 5, word: 'Nein', translation: 'No', level: 'A1' },
  { id: 6, word: 'Entschuldigung', translation: 'Sorry / Excuse me', level: 'A1' },
  { id: 7, word: 'Tschüss', translation: 'Bye', level: 'A1' },
  { id: 8, word: 'Guten Morgen', translation: 'Good morning', level: 'A1' },
  { id: 9, word: 'Guten Tag', translation: 'Good day', level: 'A1' },
  { id: 10, word: 'Guten Abend', translation: 'Good evening', level: 'A1' },
  { id: 11, word: 'Wasser', translation: 'Water', level: 'A1' },
  { id: 12, word: 'Brot', translation: 'Bread', level: 'A1' },
  { id: 13, word: 'Haus', translation: 'House', level: 'A1' },
  { id: 14, word: 'Auto', translation: 'Car', level: 'A1' },
  { id: 15, word: 'Schule', translation: 'School', level: 'A1' },
  { id: 16, word: 'Freund', translation: 'Friend', level: 'A1' },
  { id: 17, word: 'Familie', translation: 'Family', level: 'A1' },
  { id: 18, word: 'Straße', translation: 'Street', level: 'A1' },
  { id: 19, word: 'Stadt', translation: 'City', level: 'A1' },
  { id: 20, word: 'Land', translation: 'Country', level: 'A1' },
  { id: 21, word: 'Liebe', translation: 'Love', level: 'A2' },
  { id: 22, word: 'Arbeit', translation: 'Work', level: 'A2' },
  { id: 23, word: 'Zeit', translation: 'Time', level: 'A2' },
  { id: 24, word: 'Jahr', translation: 'Year', level: 'A2' },
  { id: 25, word: 'Tag', translation: 'Day', level: 'A2' },
];

export const getRandomWord = (level?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1'): VocabularyItem => {
  let filteredVocabulary = vocabulary;
  
  if (level) {
    filteredVocabulary = vocabulary.filter(item => item.level === level);
  }
  
  const randomIndex = Math.floor(Math.random() * filteredVocabulary.length);
  return filteredVocabulary[randomIndex];
};

export const getNextWord = (currentId: number, level?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1'): VocabularyItem => {
  let filteredVocabulary = vocabulary;
  
  if (level) {
    filteredVocabulary = vocabulary.filter(item => item.level === level);
  }
  
  const currentIndex = filteredVocabulary.findIndex(item => item.id === currentId);
  const nextIndex = (currentIndex + 1) % filteredVocabulary.length;
  
  return filteredVocabulary[nextIndex];
}; 