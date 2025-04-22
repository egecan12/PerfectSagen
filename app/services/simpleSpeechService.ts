/**
 * Simple Speech Service
 * Uses the browser's Web Speech API for speech recognition
 */

/**
 * Interface for transcription result
 */
export interface TranscriptionResult {
  text: string;
  error?: string;
}

/**
 * Interface for pronunciation analysis result
 */
export interface PronunciationAnalysis {
  score: number;
  feedback: string;
  details: {
    phoneticAccuracy: number;
    rhythmAccuracy: number;
    stressAccuracy: number;
  };
  error?: string;
}

/**
 * Record audio and transcribe using Web Speech API
 */
export const recordAndTranscribe = (language: string = 'de-DE'): Promise<TranscriptionResult> => {
  return new Promise((resolve, reject) => {
    // Check if browser supports speech recognition
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      resolve({
        text: '',
        error: 'Speech recognition is not supported in your browser'
      });
      return;
    }

    try {
      // Initialize speech recognition
      const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognitionClass) {
        resolve({
          text: '',
          error: 'Speech recognition is not supported in your browser'
        });
        return;
      }

      const recognition = new SpeechRecognitionClass();
      
      // Configure
      recognition.lang = language;
      recognition.interimResults = false;
      
      // Handle results
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        resolve({ text: transcript });
      };
      
      // Handle errors
      recognition.onerror = (event) => {
        resolve({
          text: '',
          error: `Speech recognition error: ${event.error}`
        });
      };
      
      // Handle end of speech
      recognition.onend = () => {
        // If no result was returned, resolve with empty string
        resolve({ text: '' });
      };
      
      // Start recording
      recognition.start();
      
    } catch (error) {
      resolve({
        text: '',
        error: error instanceof Error ? error.message : 'Unknown error during speech recognition'
      });
    }
  });
};

/**
 * Calculate Levenshtein distance between two strings
 */
const levenshteinDistance = (a: string, b: string): number => {
  const matrix = [];
  
  // Initialize the first row
  for (let i = 0; i <= a.length; i++) {
    matrix[i] = [i];
  }
  
  // Initialize the first column
  for (let j = 0; j <= b.length; j++) {
    matrix[0][j] = j;
  }
  
  // Fill in the rest of the matrix
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // deletion
        matrix[i][j - 1] + 1,      // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }
  
  return matrix[a.length][b.length];
};

/**
 * Normalize German text for comparison
 */
const normalizeGermanText = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Get detailed phonetic analysis by comparing characters
 */
const getPhoneticAnalysis = (spoken: string, expected: string): number => {
  const normalizedSpoken = normalizeGermanText(spoken);
  const normalizedExpected = normalizeGermanText(expected);
  
  if (normalizedExpected.length === 0) return 0;
  
  const distance = levenshteinDistance(normalizedSpoken, normalizedExpected);
  const maxLength = Math.max(normalizedSpoken.length, normalizedExpected.length);
  const similarity = Math.max(0, 100 - (distance / maxLength) * 100);
  
  return Math.round(similarity);
};

/**
 * Get rhythm analysis by comparing word lengths
 */
const getRhythmAnalysis = (spoken: string, expected: string): number => {
  const spokenWords = normalizeGermanText(spoken).split(' ');
  const expectedWords = normalizeGermanText(expected).split(' ');
  
  if (spokenWords.length !== expectedWords.length) {
    return Math.max(0, 70 - Math.abs(spokenWords.length - expectedWords.length) * 10);
  }
  
  let totalScore = 0;
  const minLength = Math.min(spokenWords.length, expectedWords.length);
  
  for (let i = 0; i < minLength; i++) {
    const lengthDiff = Math.abs(spokenWords[i].length - expectedWords[i].length);
    const wordScore = Math.max(0, 100 - lengthDiff * 15);
    totalScore += wordScore;
  }
  
  return Math.round(totalScore / Math.max(1, minLength));
};

/**
 * Get stress analysis by comparing word positions
 */
const getStressAnalysis = (spoken: string, expected: string): number => {
  const spokenWords = normalizeGermanText(spoken).split(' ');
  const expectedWords = normalizeGermanText(expected).split(' ');
  
  if (spokenWords.length <= 1 || expectedWords.length <= 1) {
    return 70;
  }
  
  let totalScore = 0;
  const minLength = Math.min(spokenWords.length, expectedWords.length);
  
  for (let i = 0; i < minLength; i++) {
    if (spokenWords[i] === expectedWords[i]) {
      totalScore += 100;
    } else {
      const similarity = 100 - (levenshteinDistance(spokenWords[i], expectedWords[i]) / 
                          Math.max(spokenWords[i].length, expectedWords[i].length)) * 100;
      totalScore += similarity;
    }
  }
  
  return Math.round(totalScore / Math.max(1, minLength));
};

/**
 * Get feedback based on score
 */
const getFeedback = (score: number, spoken: string, expected: string): string => {
  if (score >= 90) return 'Excellent pronunciation!';
  if (score >= 75) return 'Very good pronunciation, keep practicing!';
  if (score >= 60) return 'Good effort, try to pronounce more clearly.';
  if (score >= 40) return 'Keep practicing, focus on pronouncing each syllable.';
  
  const normalizedSpoken = normalizeGermanText(spoken);
  const normalizedExpected = normalizeGermanText(expected);
  
  const spokenChars = [...normalizedSpoken];
  const expectedChars = [...normalizedExpected];
  
  let mismatchFound = false;
  let mismatchDetails = '';
  
  for (let i = 0; i < Math.min(spokenChars.length, expectedChars.length); i++) {
    if (spokenChars[i] !== expectedChars[i]) {
      mismatchFound = true;
      mismatchDetails = `Try to pronounce "${expectedChars[i]}" instead of "${spokenChars[i]}".`;
      break;
    }
  }
  
  if (mismatchFound) {
    return `Practice needed. ${mismatchDetails}`;
  }
  
  return 'Try again and speak more clearly.';
};

/**
 * Analyze pronunciation locally
 */
export const analyzePronunciation = (
  transcribed: string, 
  expected: string
): PronunciationAnalysis => {
  try {
    // If transcript is empty, return a default message
    if (!transcribed || transcribed.trim() === '') {
      return {
        score: 0,
        feedback: 'No speech detected. Please try again and speak more clearly.',
        details: {
          phoneticAccuracy: 0,
          rhythmAccuracy: 0,
          stressAccuracy: 0
        }
      };
    }
    
    const phoneticAccuracy = getPhoneticAnalysis(transcribed, expected);
    const rhythmAccuracy = getRhythmAnalysis(transcribed, expected);
    const stressAccuracy = getStressAnalysis(transcribed, expected);
    
    const score = Math.round((phoneticAccuracy * 0.6) + (rhythmAccuracy * 0.2) + (stressAccuracy * 0.2));
    const feedback = getFeedback(score, transcribed, expected);
    
    return {
      score,
      feedback,
      details: {
        phoneticAccuracy,
        rhythmAccuracy,
        stressAccuracy
      }
    };
  } catch (error) {
    return {
      score: 0,
      feedback: 'Error analyzing pronunciation',
      details: {
        phoneticAccuracy: 0,
        rhythmAccuracy: 0,
        stressAccuracy: 0
      },
      error: error instanceof Error ? error.message : 'Unknown analysis error'
    };
  }
}; 