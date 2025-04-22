import React from 'react';
import { FaMicrophone, FaStop, FaSpinner } from 'react-icons/fa';

interface VocabularyCardProps {
  word: string;
  translation: string;
  onRecordStart: () => void;
  onRecordStop: () => void;
  isRecording: boolean;
  isProcessing: boolean;
}

const VocabularyCard: React.FC<VocabularyCardProps> = ({
  word,
  translation,
  onRecordStart,
  onRecordStop,
  isRecording,
  isProcessing
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-lg mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">{word}</h2>
        <p className="text-lg text-gray-600">{translation}</p>
      </div>
      
      <div className="flex flex-col items-center">
        <button
          onClick={isRecording ? onRecordStop : onRecordStart}
          disabled={isProcessing}
          className={`flex items-center justify-center w-16 h-16 rounded-full 
            ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'} 
            ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'opacity-100 cursor-pointer'}
            text-white transition-colors duration-300`}
          aria-label={isRecording ? 'Stop recording' : 'Start recording'}
        >
          {isProcessing ? (
            <FaSpinner className="text-xl animate-spin" />
          ) : isRecording ? (
            <FaStop className="text-xl" />
          ) : (
            <FaMicrophone className="text-xl" />
          )}
        </button>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">
            {isProcessing 
              ? 'Processing... Please wait.' 
              : isRecording 
                ? 'Listening... Click to stop' 
                : 'Click the microphone to practice pronunciation'}
          </p>
        </div>
      </div>
      
      {/* Processing indicator */}
      {isProcessing && (
        <div className="mt-6 bg-blue-50 text-blue-700 p-3 rounded-md text-center">
          <p className="font-medium">Your recording is being analyzed</p>
          <p className="text-sm mt-1">This may take a few moments...</p>
        </div>
      )}
    </div>
  );
};

export default VocabularyCard; 