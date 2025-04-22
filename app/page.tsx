'use client';

import { useState, useEffect, useCallback } from 'react';
import { FaArrowRight, FaInfoCircle } from 'react-icons/fa';
import VocabularyCard from './components/VocabularyCard';
import PronunciationMeter from './components/PronunciationMeter';
import useSimplePronunciation from './hooks/useSimplePronunciation';
import { getRandomWord, VocabularyItem } from './data/vocabulary';

export default function Home() {
  // State for current word and level
  const [currentWord, setCurrentWord] = useState<VocabularyItem | null>(null);
  const [level, setLevel] = useState<'A1' | 'A2' | 'B1' | 'B2' | 'C1'>('A1');
  const [showResults, setShowResults] = useState<boolean>(false);

  // Load a random word when the component mounts or level changes
  useEffect(() => {
    setCurrentWord(getRandomWord(level));
    setShowResults(false);
  }, [level]);

  // Initialize pronunciation hook with the current word
  const { 
    isRecording, 
    isProcessing,
    transcribedText, 
    analysisResult,
    startListening, 
    stopListening, 
    error: pronunciationError
  } = useSimplePronunciation(currentWord?.word || '');

  // Handle recording start
  const handleRecordStart = useCallback(async () => {
    setShowResults(false);
    await startListening();
  }, [startListening]);

  // Handle recording stop and evaluate pronunciation
  const handleRecordStop = useCallback(async () => {
    await stopListening();
    setShowResults(true);
  }, [stopListening]);

  // Handle next word
  const handleNextWord = useCallback(() => {
    setCurrentWord(getRandomWord(level));
    setShowResults(false);
  }, [level]);

  // Handle level change
  const handleLevelChange = (newLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1') => {
    setLevel(newLevel);
  };

  if (!currentWord) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-8 md:p-16 lg:p-24 bg-gray-50">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8">Learn German Pronunciation</h1>
      
      {/* Level selector */}
      <div className="mb-8">
        <div className="flex space-x-2">
          {(['A1', 'A2'] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => handleLevelChange(lvl)}
              className={`px-4 py-2 rounded-md ${
                level === lvl
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Vocabulary card */}
      <VocabularyCard
        word={currentWord.word}
        translation={currentWord.translation}
        onRecordStart={handleRecordStart}
        onRecordStop={handleRecordStop}
        isRecording={isRecording}
        isProcessing={isProcessing}
      />

      {/* Instructions */}
      <div className="mt-4 text-center max-w-md bg-blue-50 p-3 rounded-md border border-blue-100">
        <h3 className="font-medium text-blue-800 mb-1">Speech Recognition</h3>
        <ol className="text-sm text-blue-700 text-left list-decimal list-inside">
          <li>Click the blue microphone button and allow microphone access</li>
          <li>Pronounce the German word shown above</li>
          <li>Click the red stop button when finished</li>
          <li>View your pronunciation score</li>
        </ol>
      </div>

      {/* Error message */}
      {pronunciationError && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md max-w-lg w-full">
          <p className="font-medium">Error</p>
          <p className="text-sm">{pronunciationError}</p>
        </div>
      )}

      {/* Results section */}
      {showResults && analysisResult && (
        <div className="mt-8 w-full max-w-lg">
          <div className="mb-4 p-4 bg-white rounded-lg shadow-md">
            <h3 className="text-lg font-medium text-gray-800 mb-2">Your pronunciation:</h3>
            <p className="text-gray-600 italic">&quot;{transcribedText}&quot;</p>
            <div className="mt-2 pt-2 border-t border-gray-100">
              <p className="text-sm text-gray-500">Expected: <span className="font-medium">&quot;{currentWord.word}&quot;</span></p>
            </div>
          </div>
          
          <div className="mb-6 p-6 bg-white rounded-lg shadow-md">
            <PronunciationMeter 
              accuracy={analysisResult.score}
              phoneticAccuracy={analysisResult.details.phoneticAccuracy}
              rhythmAccuracy={analysisResult.details.rhythmAccuracy}
              stressAccuracy={analysisResult.details.stressAccuracy}
              feedback={analysisResult.feedback}
            />
          </div>
          
          <div className="flex justify-center">
            <button
              onClick={handleNextWord}
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
            >
              <span>Next Word</span>
              <FaArrowRight />
            </button>
          </div>
        </div>
      )}
      
      {/* Client-side only warning */}
      <div className="mt-8 text-sm text-gray-500 text-center">
        <p>Pronunciation analysis requires a modern browser with microphone access</p>
        <p className="mt-1">
          Powered by Web Speech API and pronunciation analysis
        </p>
      </div>
    </main>
  );
}
