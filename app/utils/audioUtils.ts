// Audio recording and processing utilities

/**
 * Interface for audio recorder
 */
export interface AudioRecorder {
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<Blob>;
  isRecording: boolean;
  error: string | null;
}

/**
 * Custom hook for recording audio
 * @returns AudioRecorder interface
 */
export function useAudioRecorder(): AudioRecorder {
  let mediaRecorder: MediaRecorder | null = null;
  let audioChunks: Blob[] = [];
  let isRecording = false;
  let error: string | null = null;

  const startRecording = async (): Promise<void> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);
      audioChunks = [];
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };
      
      mediaRecorder.start();
      isRecording = true;
    } catch (err) {
      error = "Failed to start recording: " + (err instanceof Error ? err.message : String(err));
    }
  };

  const stopRecording = async (): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      if (!mediaRecorder) {
        reject(new Error("No recording in progress"));
        return;
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        isRecording = false;
        
        // Stop all tracks in the stream
        mediaRecorder?.stream.getTracks().forEach(track => track.stop());
        
        resolve(audioBlob);
      };

      mediaRecorder.stop();
    });
  };

  return {
    startRecording,
    stopRecording,
    isRecording,
    error
  };
}

/**
 * Convert audio blob to base64 string
 * @param blob Audio blob
 * @returns Promise resolving to base64 string
 */
export const blobToBase64 = async (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        // Remove the data URL prefix (e.g., "data:audio/wav;base64,")
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error('Failed to convert blob to base64'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}; 