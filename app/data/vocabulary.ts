export interface VocabularyItem {
  id: number;
  word: string;
  translation: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
  sentence?: string;
  sentenceTranslation?: string;
}

export const vocabulary: VocabularyItem[] = [
  { id: 1, word: 'Hallo', translation: 'Hello', level: 'A1', sentence: 'Hallo, wie geht es dir?', sentenceTranslation: 'Hello, how are you?' },
  { id: 2, word: 'Danke', translation: 'Thank you', level: 'A1', sentence: 'Vielen Danke für deine Hilfe.', sentenceTranslation: 'Thank you very much for your help.' },
  { id: 3, word: 'Bitte', translation: 'Please / You\'re welcome', level: 'A1', sentence: 'Bitte schön, gern geschehen.', sentenceTranslation: 'You\'re welcome, my pleasure.' },
  { id: 4, word: 'Ja', translation: 'Yes', level: 'A1', sentence: 'Ja, ich verstehe dich.', sentenceTranslation: 'Yes, I understand you.' },
  { id: 5, word: 'Nein', translation: 'No', level: 'A1', sentence: 'Nein, das ist nicht richtig.', sentenceTranslation: 'No, that is not correct.' },
  { id: 6, word: 'Entschuldigung', translation: 'Sorry / Excuse me', level: 'A1', sentence: 'Entschuldigung, können Sie mir helfen?', sentenceTranslation: 'Excuse me, can you help me?' },
  { id: 7, word: 'Tschüss', translation: 'Bye', level: 'A1', sentence: 'Tschüss, bis morgen!', sentenceTranslation: 'Bye, see you tomorrow!' },
  { id: 8, word: 'Guten Morgen', translation: 'Good morning', level: 'A1', sentence: 'Guten Morgen! Wie hast du geschlafen?', sentenceTranslation: 'Good morning! How did you sleep?' },
  { id: 9, word: 'Guten Tag', translation: 'Good day', level: 'A1', sentence: 'Guten Tag, kann ich Ihnen helfen?', sentenceTranslation: 'Good day, can I help you?' },
  { id: 10, word: 'Guten Abend', translation: 'Good evening', level: 'A1', sentence: 'Guten Abend, schön Sie zu sehen.', sentenceTranslation: 'Good evening, nice to see you.' },
  { id: 11, word: 'Wasser', translation: 'Water', level: 'A1', sentence: 'Ich trinke ein Glas Wasser.', sentenceTranslation: 'I am drinking a glass of water.' },
  { id: 12, word: 'Brot', translation: 'Bread', level: 'A1', sentence: 'Das frische Brot schmeckt gut.', sentenceTranslation: 'The fresh bread tastes good.' },
  { id: 13, word: 'Haus', translation: 'House', level: 'A1', sentence: 'Mein Haus ist nicht weit von hier.', sentenceTranslation: 'My house is not far from here.' },
  { id: 14, word: 'Auto', translation: 'Car', level: 'A1', sentence: 'Das Auto ist blau.', sentenceTranslation: 'The car is blue.' },
  { id: 15, word: 'Schule', translation: 'School', level: 'A1', sentence: 'Die Schule beginnt um acht Uhr.', sentenceTranslation: 'School starts at eight o\'clock.' },
  { id: 16, word: 'Freund', translation: 'Friend', level: 'A1', sentence: 'Er ist mein bester Freund.', sentenceTranslation: 'He is my best friend.' },
  { id: 17, word: 'Familie', translation: 'Family', level: 'A1', sentence: 'Meine Familie wohnt in Berlin.', sentenceTranslation: 'My family lives in Berlin.' },
  { id: 18, word: 'Straße', translation: 'Street', level: 'A1', sentence: 'Die Straße ist sehr breit.', sentenceTranslation: 'The street is very wide.' },
  { id: 19, word: 'Stadt', translation: 'City', level: 'A1', sentence: 'Diese Stadt hat viele Museen.', sentenceTranslation: 'This city has many museums.' },
  { id: 20, word: 'Land', translation: 'Country', level: 'A1', sentence: 'Deutschland ist ein schönes Land.', sentenceTranslation: 'Germany is a beautiful country.' },
  { id: 21, word: 'Liebe', translation: 'Love', level: 'A2', sentence: 'Die Liebe ist ein wunderbares Gefühl.', sentenceTranslation: 'Love is a wonderful feeling.' },
  { id: 22, word: 'Arbeit', translation: 'Work', level: 'A2', sentence: 'Meine Arbeit macht mir Spaß.', sentenceTranslation: 'I enjoy my work.' },
  { id: 23, word: 'Zeit', translation: 'Time', level: 'A2', sentence: 'Ich habe keine Zeit heute.', sentenceTranslation: 'I don\'t have time today.' },
  { id: 24, word: 'Jahr', translation: 'Year', level: 'A2', sentence: 'Letztes Jahr war ich in München.', sentenceTranslation: 'Last year I was in Munich.' },
  { id: 25, word: 'Tag', translation: 'Day', level: 'A2', sentence: 'Heute ist ein schöner Tag.', sentenceTranslation: 'Today is a beautiful day.' },
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