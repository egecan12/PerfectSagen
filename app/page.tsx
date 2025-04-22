'use client';

import { useState, useEffect, useCallback } from 'react';
import { FaArrowRight, FaInfoCircle } from 'react-icons/fa';
import VocabularyCard from './components/VocabularyCard';
import PronunciationMeter from './components/PronunciationMeter';
import CircularProgressMeter from './components/CircularProgressMeter';
import useSimplePronunciation from './hooks/useSimplePronunciation';
import { getRandomWord, VocabularyItem } from './data/vocabulary';

export default function Home() {
  // State for current word and level
  const [currentWord, setCurrentWord] = useState<VocabularyItem | null>(null);
  const [level, setLevel] = useState<'A1' | 'A2' | 'B1' | 'B2' | 'C1'>('A1');
  const [showResults, setShowResults] = useState<boolean>(false);
  const [isSentenceMode, setIsSentenceMode] = useState<boolean>(false);

  // Load a random word when the component mounts or level changes
  useEffect(() => {
    setCurrentWord(getRandomWord(level));
    setShowResults(false);
  }, [level]);

  // Initialize pronunciation hook with the current word or sentence
  const { 
    isRecording, 
    isProcessing,
    transcribedText, 
    analysisResult,
    startListening, 
    stopListening, 
    error: pronunciationError
  } = useSimplePronunciation(isSentenceMode && currentWord?.sentence 
      ? currentWord.sentence 
      : currentWord?.word || '');

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

  // Handle toggle between word and sentence mode
  const handleToggleMode = useCallback(() => {
    setIsSentenceMode((prev) => !prev);
    setShowResults(false);
  }, []);

  if (!currentWord) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-8 md:p-16 lg:p-24 bg-slate-900">
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">Learn German Pronunciation</h1>
      
      {/* Level selector */}
      <div className="mb-8">
        <div className="flex space-x-2">
          {(['A1', 'A2'] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => handleLevelChange(lvl)}
              className={`px-4 py-2 rounded-md ${
                level === lvl
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
              } transition-all duration-200`}
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
        sentence={currentWord.sentence}
        sentenceTranslation={currentWord.sentenceTranslation}
        onRecordStart={handleRecordStart}
        onRecordStop={handleRecordStop}
        isRecording={isRecording}
        isProcessing={isProcessing}
        isSentenceMode={isSentenceMode}
        onToggleMode={handleToggleMode}
      />

      {/* Instructions */}
      <div className="mt-4 text-center max-w-md bg-slate-800 p-4 rounded-lg border border-slate-700 shadow-md">
        <h3 className="font-medium text-blue-400 mb-2">Speech Recognition</h3>
        <ol className="text-sm text-slate-300 text-left list-decimal list-inside">
          <li>Click the blue microphone button and allow microphone access</li>
          <li>Pronounce the German {isSentenceMode ? 'sentence' : 'word'} shown above</li>
          <li>Click the red stop button when finished</li>
          <li>View your pronunciation score</li>
        </ol>
      </div>

      {/* Error message */}
      {pronunciationError && (
        <div className="mt-4 p-3 bg-red-900/50 text-red-200 rounded-md max-w-lg w-full border border-red-700">
          <p className="font-medium">Error</p>
          <p className="text-sm">{pronunciationError}</p>
        </div>
      )}

      {/* Results section */}
      {showResults && analysisResult && (
        <div className="mt-8 w-full max-w-lg">
          <div className="mb-4 p-4 bg-slate-800 rounded-lg shadow-md border border-slate-700">
            <h3 className="text-lg font-medium text-white mb-2">Your pronunciation:</h3>
            <p className="text-slate-300 italic">&quot;{transcribedText}&quot;</p>
            <div className="mt-2 pt-2 border-t border-slate-700">
              <p className="text-sm text-slate-400">Expected: <span className="font-medium text-blue-300">&quot;{isSentenceMode && currentWord.sentence ? currentWord.sentence : currentWord.word}&quot;</span></p>
            </div>
          </div>
          
          <div className="mb-6 p-6 bg-slate-800 rounded-lg shadow-md border border-slate-700">
            <PronunciationMeter 
              accuracy={analysisResult.score}
              phoneticAccuracy={analysisResult.details.phoneticAccuracy}
              rhythmAccuracy={analysisResult.details.rhythmAccuracy}
              stressAccuracy={analysisResult.details.stressAccuracy}
              feedback={analysisResult.feedback}
            />
          </div>
          
          {/* New Circular Progress Meter */}
          <div className="mb-6">
            <CircularProgressMeter 
              items={[
                { 
                  value: analysisResult.details.phoneticAccuracy, 
                  label: 'Fonetik', 
                  color: 'dynamic'
                },
                { 
                  value: analysisResult.details.stressAccuracy, 
                  label: 'Vurgu', 
                  color: 'dynamic'
                },
                { 
                  value: analysisResult.details.rhythmAccuracy, 
                  label: 'Ritim', 
                  color: 'dynamic'
                }
              ]}
              title="Telaffuz Değerlendirme"
              subtitle="Almanca"
            />
          </div>
          
          <div className="flex justify-center">
            <button
              onClick={handleNextWord}
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-lg"
            >
              <span>Next {isSentenceMode ? 'Sentence' : 'Word'}</span>
              <FaArrowRight />
            </button>
          </div>
        </div>
      )}
      
      {/* Client-side only warning */}
      <div className="mt-8 text-sm text-slate-500 text-center">
        <p>Pronunciation analysis requires a modern browser with microphone access</p>
        <p className="mt-1">
          Powered by Web Speech API and pronunciation analysis
        </p>
      </div>
    </main>
  );
}
