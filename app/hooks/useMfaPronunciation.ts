import { useState, useCallback, useRef } from 'react';
import { 
  transcribeAudio, 
  analyzePronunciation,
  checkMfaBackendAvailability,
  TranscriptionResult,
  PronunciationAnalysis
} from '../services/mfaTranscriptionService';

// Interface for the hook return value
export interface MfaPronunciationHook {
  isBackendAvailable: boolean;
  isCheckingBackend: boolean;
  isRecording: boolean;
  isProcessing: boolean;
  audioChunks: Blob[];
  transcribedText: string;
  analysisResult: PronunciationAnalysis | null;
  error: string | null;
  checkBackendAvailability: () => Promise<boolean>;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  clearResults: () => void;
}

/**
 * Hook for capturing audio and analyzing pronunciation using Montreal Forced Aligner
 * @param expectedText The expected text that the user should pronounce
 * @returns Pronunciation hook interface
 */
const useMfaPronunciation = (expectedText: string): MfaPronunciationHook => {
  // State
  const [isBackendAvailable, setIsBackendAvailable] = useState<boolean>(false);
  const [isCheckingBackend, setIsCheckingBackend] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [transcribedText, setTranscribedText] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<PronunciationAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Refs
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  
  // Check if the MFA backend is available
  const checkBackendAvailability = useCallback(async (): Promise<boolean> => {
    try {
      setIsCheckingBackend(true);
      setError(null);
      
      const available = await checkMfaBackendAvailability();
      setIsBackendAvailable(available);
      
      if (!available) {
        setError("Montreal Forced Aligner backend is not available.");
      }
      
      return available;
    } catch (err) {
      setError(`Error checking backend availability: ${err instanceof Error ? err.message : String(err)}`);
      setIsBackendAvailable(false);
      return false;
    } finally {
      setIsCheckingBackend(false);
    }
  }, []);
  
  // Start recording audio
  const startRecording = useCallback(async () => {
    try {
      // Check if browser supports MediaRecorder
      if (!window.MediaRecorder) {
        setError("MediaRecorder API is not supported in this browser");
        return;
      }
      
      // Clear previous results
      setError(null);
      setTranscribedText('');
      setAnalysisResult(null);
      setAudioChunks([]);
      
      // Check backend availability before recording
      const isAvailable = await checkBackendAvailability();
      if (!isAvailable) {
        return;
      }
      
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create media recorder
      const recorder = new MediaRecorder(stream);
      mediaRecorder.current = recorder;
      
      // Set up event handlers
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setAudioChunks((chunks) => [...chunks, event.data]);
        }
      };
      
      // Start recording
      recorder.start();
      setIsRecording(true);
    } catch (err) {
      setError(`Recording error: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [checkBackendAvailability]);
  
  // Stop recording and process audio
  const stopRecording = useCallback(async () => {
    if (!mediaRecorder.current || !isRecording) {
      setError("No recording in progress");
      return;
    }
    
    try {
      setIsRecording(false);
      setIsProcessing(true);
      
      // Stop recording
      return new Promise<void>((resolve, reject) => {
        if (!mediaRecorder.current) {
          reject(new Error("No recording in progress"));
          return;
        }
        
        mediaRecorder.current.onstop = async () => {
          try {
            // Create a Blob from the recorded chunks
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            
            // Stop all tracks in the stream
            mediaRecorder.current?.stream.getTracks().forEach(track => track.stop());
            
            // Step 1: Transcribe with Whisper
            const transcription = await transcribeAudio(audioBlob);
            
            if (transcription.error) {
              setError(`Transcription error: ${transcription.error}`);
              setIsProcessing(false);
              resolve();
              return;
            }
            
            setTranscribedText(transcription.text);
            
            // Step 2: Analyze pronunciation with MFA backend
            const analysis = await analyzePronunciation(audioBlob, expectedText);
            
            if (analysis.error) {
              setError(`Analysis error: ${analysis.error}`);
              setIsProcessing(false);
              resolve();
              return;
            }
            
            setAnalysisResult(analysis);
            setIsProcessing(false);
            resolve();
          } catch (err) {
            setError("Processing error: " + (err instanceof Error ? err.message : String(err)));
            setIsProcessing(false);
            resolve();
          }
        };
        
        mediaRecorder.current.stop();
      });
    } catch (err) {
      setError(`Error stopping recording: ${err instanceof Error ? err.message : String(err)}`);
      setIsProcessing(false);
    }
  }, [audioChunks, expectedText, isRecording]);
  
  // Clear results
  const clearResults = useCallback(() => {
    setTranscribedText('');
    setAnalysisResult(null);
    setError(null);
    setAudioChunks([]);
  }, []);
  
  // Check backend availability on mount
  useState(() => {
    checkBackendAvailability();
  });
  
  return {
    isBackendAvailable,
    isCheckingBackend,
    isRecording,
    isProcessing,
    audioChunks,
    transcribedText,
    analysisResult,
    error,
    checkBackendAvailability,
    startRecording,
    stopRecording,
    clearResults
  };
};

export default useMfaPronunciation; 