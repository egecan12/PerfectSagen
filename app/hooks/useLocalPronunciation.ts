import { useState, useCallback, useEffect } from 'react';
import { transcribeAudio, analyzePronunciation, PronunciationAnalysis } from '../services/localTranscriptionService';

interface LocalPronunciationHook {
  isRecording: boolean;
  isProcessing: boolean;
  transcribedText: string;
  analysisResult: PronunciationAnalysis | null;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  error: string | null;
  isModelLoading: boolean;
  modelLoadingProgress: number;
}

let mediaRecorder: MediaRecorder | null = null;
let audioChunks: Blob[] = [];

const useLocalPronunciation = (expectedText: string): LocalPronunciationHook => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [analysisResult, setAnalysisResult] = useState<PronunciationAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [modelLoadingProgress, setModelLoadingProgress] = useState(0);
  
  // Set up the global progress event listener for model loading
  useEffect(() => {
    const handleModelLoading = (event: CustomEvent) => {
      if (event.detail && typeof event.detail.progress === 'number') {
        setModelLoadingProgress(Math.round(event.detail.progress * 100));
      }
    };
    
    // Create a custom event for model loading progress
    window.addEventListener('modelLoading', handleModelLoading as EventListener);
    
    return () => {
      window.removeEventListener('modelLoading', handleModelLoading as EventListener);
      
      // Cleanup media recorder
      if (mediaRecorder) {
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startRecording = useCallback(async () => {
    setError(null);
    setTranscribedText('');
    setAnalysisResult(null);
    audioChunks = [];
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };
      
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      setError("Failed to start recording: " + (err instanceof Error ? err.message : String(err)));
    }
  }, []);

  const stopRecording = useCallback(async () => {
    if (!mediaRecorder || !isRecording) {
      setError("No recording in progress");
      return;
    }
    
    try {
      setIsRecording(false);
      setIsProcessing(true);
      setIsModelLoading(true);
      
      // Stop recording
      return new Promise<void>((resolve, reject) => {
        if (!mediaRecorder) {
          reject(new Error("No recording in progress"));
          return;
        }
        
        mediaRecorder.onstop = async () => {
          try {
            // Create a Blob from the recorded chunks
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            
            // Stop all tracks in the stream
            mediaRecorder?.stream.getTracks().forEach(track => track.stop());
            
            // Step 1: Transcribe with local Whisper model
            const transcription = await transcribeAudio(audioBlob);
            setIsModelLoading(false);
            
            if (transcription.error) {
              setError(`Transcription error: ${transcription.error}`);
              setIsProcessing(false);
              resolve();
              return;
            }
            
            setTranscribedText(transcription.text);
            
            // Step 2: Analyze pronunciation with our local implementation
            const analysis = await analyzePronunciation(transcription.text, expectedText);
            
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
            setIsModelLoading(false);
            resolve();
          }
        };
        
        mediaRecorder.stop();
      });
    } catch (err) {
      setError("Error stopping recording: " + (err instanceof Error ? err.message : String(err)));
      setIsProcessing(false);
      setIsModelLoading(false);
    }
  }, [isRecording, expectedText]);

  return {
    isRecording,
    isProcessing,
    transcribedText,
    analysisResult,
    startRecording,
    stopRecording,
    error,
    isModelLoading,
    modelLoadingProgress
  };
};

export default useLocalPronunciation; 