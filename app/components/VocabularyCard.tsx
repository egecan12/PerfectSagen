import React from 'react';
import { FaMicrophone, FaStop, FaSpinner, FaExchangeAlt } from 'react-icons/fa';

interface VocabularyCardProps {
  word: string;
  translation: string;
  sentence?: string;
  sentenceTranslation?: string;
  onRecordStart: () => void;
  onRecordStop: () => void;
  isRecording: boolean;
  isProcessing: boolean;
  isSentenceMode: boolean;
  onToggleMode: () => void;
}

const VocabularyCard: React.FC<VocabularyCardProps> = ({
  word,
  translation,
  sentence,
  sentenceTranslation,
  onRecordStart,
  onRecordStop,
  isRecording,
  isProcessing,
  isSentenceMode,
  onToggleMode
}) => {
  const displayText = isSentenceMode ? sentence || word : word;
  const displayTranslation = isSentenceMode ? sentenceTranslation || translation : translation;
  
  const hasSentence = !!sentence;

  return (
    <div className="bg-slate-800 rounded-lg shadow-md shadow-black/20 p-6 max-w-lg mx-auto border border-slate-700">
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm text-slate-400">
          {isSentenceMode ? 'Sentence Mode' : 'Word Mode'}
        </span>
        
        {hasSentence && (
          <button 
            onClick={onToggleMode}
            className="flex items-center px-3 py-1 text-sm rounded bg-slate-700 text-blue-300 hover:bg-slate-600 transition-colors"
          >
            <FaExchangeAlt className="mr-1" />
            Switch to {isSentenceMode ? 'Word' : 'Sentence'}
          </button>
        )}
      </div>
      
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-white mb-2">{displayText}</h2>
        <p className="text-lg text-blue-300">{displayTranslation}</p>
      </div>
      
      <div className="flex flex-col items-center">
        <button
          onClick={isRecording ? onRecordStop : onRecordStart}
          disabled={isProcessing}
          className={`flex items-center justify-center w-16 h-16 rounded-full 
            ${isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'} 
            ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'opacity-100 cursor-pointer'}
            text-white transition-colors duration-300 shadow-lg`}
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
          <p className="text-sm text-slate-400">
            {isProcessing 
              ? 'Processing... Please wait.' 
              : isRecording 
                ? 'Listening... Click to stop' 
                : `Click the microphone to practice ${isSentenceMode ? 'sentence' : 'word'} pronunciation`}
          </p>
        </div>
      </div>
      
      {/* Processing indicator */}
      {isProcessing && (
        <div className="mt-6 bg-slate-700 text-blue-300 p-3 rounded-md text-center border border-blue-700">
          <p className="font-medium">Your recording is being analyzed</p>
          <p className="text-sm mt-1">This may take a few moments...</p>
        </div>
      )}
    </div>
  );
};

export default VocabularyCard; 