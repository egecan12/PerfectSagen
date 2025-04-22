import { useState, useCallback, useRef } from 'react';
import { analyzePronunciation, PronunciationAnalysis } from '../services/simpleSpeechService';

interface SimplePronunciationHook {
  isRecording: boolean;
  isProcessing: boolean;
  transcribedText: string;
  analysisResult: PronunciationAnalysis | null;
  startListening: () => Promise<void>;
  stopListening: () => Promise<void>;
  error: string | null;
}

// Global speech recognition instance
let recognition: SpeechRecognition | null = null;

const useSimplePronunciation = (expectedText: string): SimplePronunciationHook => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [analysisResult, setAnalysisResult] = useState<PronunciationAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const transcriptRef = useRef('');

  const startListening = useCallback(async () => {
    try {
      setError(null);
      setTranscribedText('');
      setAnalysisResult(null);
      transcriptRef.current = '';
      
      // Check if browser supports speech recognition
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        setError('Speech recognition is not supported in your browser');
        return;
      }

      // Initialize speech recognition
      const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognitionClass) {
        setError('Speech recognition is not supported in your browser');
        return;
      }

      recognition = new SpeechRecognitionClass();
      
      // Configure
      recognition.lang = 'de-DE';
      recognition.interimResults = false;
      
      // Handle results
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        transcriptRef.current = transcript;
      };
      
      // Handle errors
      recognition.onerror = (event) => {
        setError(`Speech recognition error: ${event.error}`);
        setIsRecording(false);
      };
      
      // Start recording
      recognition.start();
      setIsRecording(true);
    } catch (err) {
      setError("Failed to start recording: " + (err instanceof Error ? err.message : String(err)));
      setIsRecording(false);
    }
  }, []);

  const stopListening = useCallback(async () => {
    if (!isRecording || !recognition) {
      return;
    }

    try {
      setIsRecording(false);
      setIsProcessing(true);
      
      // Stop the recognition
      recognition.onend = () => {
        // Get the transcript from the ref
        const finalTranscript = transcriptRef.current;
        setTranscribedText(finalTranscript);
        
        // Analyze pronunciation
        const analysis = analyzePronunciation(finalTranscript, expectedText);
        
        if (analysis.error) {
          setError(analysis.error);
          setIsProcessing(false);
          return;
        }
        
        setAnalysisResult(analysis);
        setIsProcessing(false);
      };
      
      recognition.stop();
    } catch (err) {
      setError("Error processing speech: " + (err instanceof Error ? err.message : String(err)));
      setIsProcessing(false);
    }
  }, [isRecording, expectedText]);

  return {
    isRecording,
    isProcessing,
    transcribedText,
    analysisResult,
    startListening,
    stopListening,
    error
  };
};

// Add TypeScript types
interface SpeechRecognitionEvent {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
        confidence: number;
      };
    };
  };
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

// Global types
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export default useSimplePronunciation; 