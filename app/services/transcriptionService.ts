import OpenAI from 'openai';
import { blobToBase64 } from '../utils/audioUtils';

// Initialize OpenAI client
// Note: In a production environment, use environment variables
let openai: OpenAI;

try {
  openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '', // Your API key from environment variable
    dangerouslyAllowBrowser: true // Note: In production, use server-side API calls
  });
} catch (error) {
  console.error('Failed to initialize OpenAI client:', error);
}

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
 * Transcribe audio using Whisper API
 * @param audioBlob Audio data as blob
 * @returns Promise resolving to transcription result
 */
export const transcribeAudio = async (audioBlob: Blob): Promise<TranscriptionResult> => {
  try {
    // Convert blob to base64
    const base64Audio = await blobToBase64(audioBlob);
    
    // Create a File object from the Blob
    const file = new File([audioBlob], 'audio.wav', { type: 'audio/wav' });
    
    // Call Whisper API
    const response = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      language: 'de'
    });
    
    return {
      text: response.text
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
 * Analyze pronunciation by comparing transcription to expected text
 * @param transcribed Transcribed text from Whisper
 * @param expected Expected text (correct pronunciation)
 * @returns Pronunciation analysis with score and feedback
 */
export const analyzePronunciation = async (
  transcribed: string, 
  expected: string
): Promise<PronunciationAnalysis> => {
  try {
    // This simulates what Montreal Forced Aligner would do
    // In a real implementation, you would call MFA via an API or backend
    
    // For now, we'll use GPT to simulate the analysis
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a German pronunciation expert. Compare the user's pronunciation (transcribed text) 
          to the expected text. Evaluate phonetic accuracy, rhythm, and stress. 
          Response must be in valid JSON format with the following fields:
          {
            "score": number (0-100),
            "feedback": string (helpful feedback for improvement),
            "details": {
              "phoneticAccuracy": number (0-100),
              "rhythmAccuracy": number (0-100),
              "stressAccuracy": number (0-100)
            }
          }
          `
        },
        {
          role: 'user',
          content: `Expected German text: "${expected}"\nTranscribed user pronunciation: "${transcribed}"`
        }
      ],
      response_format: { type: 'json_object' }
    });
    
    // Parse the JSON response
    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      score: result.score || 0,
      feedback: result.feedback || 'No feedback available',
      details: {
        phoneticAccuracy: result.details?.phoneticAccuracy || 0,
        rhythmAccuracy: result.details?.rhythmAccuracy || 0,
        stressAccuracy: result.details?.stressAccuracy || 0
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