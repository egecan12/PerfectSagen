import { useState, useCallback, useRef, useEffect } from 'react';
import { transcribeAudio, analyzePronunciation, PronunciationAnalysis } from '../services/transcriptionService';

interface AdvancedPronunciationHook {
  isRecording: boolean;
  isProcessing: boolean;
  transcribedText: string;
  analysisResult: PronunciationAnalysis | null;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  error: string | null;
}

let mediaRecorder: MediaRecorder | null = null;
let audioChunks: Blob[] = [];

const useAdvancedPronunciation = (expectedText: string): AdvancedPronunciationHook => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [analysisResult, setAnalysisResult] = useState<PronunciationAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Cleanup function
  useEffect(() => {
    return () => {
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
            
            // Step 1: Transcribe with Whisper
            const transcription = await transcribeAudio(audioBlob);
            
            if (transcription.error) {
              setError(`Transcription error: ${transcription.error}`);
              setIsProcessing(false);
              resolve();
              return;
            }
            
            setTranscribedText(transcription.text);
            
            // Step 2: Analyze pronunciation (normally with Montreal Forced Aligner, but simulated here)
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
            resolve();
          }
        };
        
        mediaRecorder.stop();
      });
    } catch (err) {
      setError("Error stopping recording: " + (err instanceof Error ? err.message : String(err)));
      setIsProcessing(false);
    }
  }, [isRecording, expectedText]);

  return {
    isRecording,
    isProcessing,
    transcribedText,
    analysisResult,
    startRecording,
    stopRecording,
    error
  };
};

export default useAdvancedPronunciation; 