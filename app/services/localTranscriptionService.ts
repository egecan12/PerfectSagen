import { pipeline, env } from '@xenova/transformers';

// Set environment variables for Transformers.js
env.allowLocalModels = false;
env.useBrowserCache = true;
env.allowRemoteModels = true;
env.remoteHost = 'https://huggingface.co';

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

// Create pipeline singleton to avoid reloading model
class TranscriberPipeline {
  static task = 'automatic-speech-recognition';
  static model = 'Xenova/whisper-small'; // Using small model for better results
  static instance: any = null; // Using any type to avoid TypeScript issues with the library
  static loading_promise: Promise<any> | null = null;

  static async getInstance() {
    // If already loaded, return the instance
    if (this.instance !== null) {
      return this.instance;
    }

    // If currently loading, return the loading promise
    if (this.loading_promise !== null) {
      return this.loading_promise;
    }

    // Start loading the model
    this.loading_promise = new Promise(async (resolve, reject) => {
      try {
        console.log('Loading whisper model...');
        const pipe = await pipeline(this.task as any, this.model);
        this.instance = pipe;
        console.log('Whisper model loaded successfully');
        resolve(this.instance);
      } catch (error) {
        console.error('Error loading model:', error);
        reject(error);
      }
    });

    return this.loading_promise;
  }
}

/**
 * Transcribe audio using Whisper model running locally
 * @param audioBlob Audio data as blob
 * @returns Promise resolving to transcription result
 */
export const transcribeAudio = async (audioBlob: Blob): Promise<TranscriptionResult> => {
  try {
    // Get transcriber instance
    const transcriber = await TranscriberPipeline.getInstance();
    
    if (!transcriber) {
      throw new Error("Failed to load transcription model");
    }
    
    // Convert blob to array buffer
    const audioArrayBuffer = await audioBlob.arrayBuffer();
    
    // Transcribe audio
    const result = await transcriber(audioArrayBuffer, {
      language: 'de'
    });
    
    return {
      text: result?.text?.trim() || ''
    };
  } catch (error) {
    console.error('Transcription error:', error);
    return {
      text: '',
      error: error instanceof Error ? error.message : 'Unknown transcription error'
    };
  }
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
  // This is a simplified phonetic analysis
  // In a real application, you would use proper phonetic algorithms
  
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
  
  // If words count doesn't match, penalize the score
  if (spokenWords.length !== expectedWords.length) {
    return Math.max(0, 70 - Math.abs(spokenWords.length - expectedWords.length) * 10);
  }
  
  // Compare each word length
  let totalScore = 0;
  const minLength = Math.min(spokenWords.length, expectedWords.length);
  
  for (let i = 0; i < minLength; i++) {
    const lengthDiff = Math.abs(spokenWords[i].length - expectedWords[i].length);
    const wordScore = Math.max(0, 100 - lengthDiff * 15);
    totalScore += wordScore;
  }
  
  return Math.round(totalScore / minLength);
};

/**
 * Get stress analysis by comparing word positions
 */
const getStressAnalysis = (spoken: string, expected: string): number => {
  // This is a very simplified stress analysis
  // In a real application, you would use proper linguistic models
  
  const spokenWords = normalizeGermanText(spoken).split(' ');
  const expectedWords = normalizeGermanText(expected).split(' ');
  
  // If we don't have enough data, return a default score
  if (spokenWords.length <= 1 || expectedWords.length <= 1) {
    return 70; // Default middle score
  }
  
  // Check if the same words are stressed (simplified by checking word order)
  let totalScore = 0;
  const minLength = Math.min(spokenWords.length, expectedWords.length);
  
  for (let i = 0; i < minLength; i++) {
    // If words match in position, give full score
    if (spokenWords[i] === expectedWords[i]) {
      totalScore += 100;
    } else {
      // Partial match based on character similarity
      const similarity = 100 - (levenshteinDistance(spokenWords[i], expectedWords[i]) / 
                             Math.max(spokenWords[i].length, expectedWords[i].length)) * 100;
      totalScore += similarity;
    }
  }
  
  return Math.round(totalScore / minLength);
};

/**
 * Get feedback based on score
 */
const getFeedback = (score: number, spoken: string, expected: string): string => {
  if (score >= 90) return 'Excellent pronunciation!';
  if (score >= 75) return 'Very good pronunciation, keep practicing!';
  if (score >= 60) return 'Good effort, try to pronounce more clearly.';
  if (score >= 40) return 'Keep practicing, focus on pronouncing each syllable.';
  
  // Detailed feedback for lower scores
  const normalizedSpoken = normalizeGermanText(spoken);
  const normalizedExpected = normalizeGermanText(expected);
  
  // Get specific pronunciation issues
  const spokenChars = [...normalizedSpoken];
  const expectedChars = [...normalizedExpected];
  
  // Find mismatched characters
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
 * @param transcribed Transcribed text from local Whisper
 * @param expected Expected text (correct pronunciation)
 * @returns Pronunciation analysis with score and feedback
 */
export const analyzePronunciation = async (
  transcribed: string, 
  expected: string
): Promise<PronunciationAnalysis> => {
  try {
    // Phonetic accuracy - how close the sounds match
    const phoneticAccuracy = getPhoneticAnalysis(transcribed, expected);
    
    // Rhythm accuracy - how well the rhythm/timing matches
    const rhythmAccuracy = getRhythmAnalysis(transcribed, expected);
    
    // Stress accuracy - how well word stress patterns match
    const stressAccuracy = getStressAnalysis(transcribed, expected);
    
    // Overall score - weighted average
    const score = Math.round((phoneticAccuracy * 0.6) + (rhythmAccuracy * 0.2) + (stressAccuracy * 0.2));
    
    // Generate feedback
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
    console.error('Analysis error:', error);
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