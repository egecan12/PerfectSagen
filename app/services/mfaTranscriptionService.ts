import { blobToBase64 } from '../utils/audioUtils';

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

// MFA Backend URL - in production this should be in environment variables
const MFA_BACKEND_URL = process.env.NEXT_PUBLIC_MFA_BACKEND_URL || 'http://localhost:5001';

/**
 * Check if the MFA backend is available
 * @returns Promise resolving to boolean indicating if backend is available
 */
export const checkMfaBackendAvailability = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${MFA_BACKEND_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('MFA backend is available:', data);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking MFA backend availability:', error);
    return false;
  }
};

/**
 * Transcribe audio using Whisper API (same as transcriptionService.ts)
 * Note: In a full implementation, you might want to move this to the MFA backend
 * since Whisper will run more efficiently on the server
 * 
 * @param audioBlob Audio data as blob
 * @returns Promise resolving to transcription result
 */
export const transcribeAudio = async (audioBlob: Blob): Promise<TranscriptionResult> => {
  try {
    // For now, we'll just reuse the OpenAI Whisper API
    // In a production environment, you might want to use a local Whisper implementation
    // or move this to the backend
    
    // Import the main transcription service (to reuse the Whisper functionality)
    const { transcribeAudio: whisperTranscribe } = await import('./transcriptionService');
    return whisperTranscribe(audioBlob);
  } catch (error) {
    console.error('Transcription error:', error);
    return {
      text: '',
      error: error instanceof Error ? error.message : 'Unknown transcription error'
    };
  }
};

/**
 * Analyze pronunciation using the MFA backend
 * @param audioBlob Audio data as blob
 * @param expected Expected text (correct pronunciation)
 * @returns Promise resolving to pronunciation analysis
 */
export const analyzePronunciation = async (
  audioBlob: Blob, 
  expected: string
): Promise<PronunciationAnalysis> => {
  try {
    // Check if MFA backend is available
    const isAvailable = await checkMfaBackendAvailability();
    if (!isAvailable) {
      throw new Error('MFA backend is not available');
    }
    
    // Create a FormData object to send the audio file and expected text
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.wav');
    formData.append('expected_text', expected);
    
    // Call the MFA backend API
    const response = await fetch(`${MFA_BACKEND_URL}/api/analyze_pronunciation`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to analyze pronunciation');
    }
    
    // Parse the response
    const result = await response.json();
    
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