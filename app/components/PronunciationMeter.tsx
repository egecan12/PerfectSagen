import React from 'react';

interface PronunciationMeterProps {
  accuracy: number;
  phoneticAccuracy?: number;
  rhythmAccuracy?: number;
  stressAccuracy?: number;
  feedback?: string;
}

const PronunciationMeter: React.FC<PronunciationMeterProps> = ({ 
  accuracy,
  phoneticAccuracy = 0,
  rhythmAccuracy = 0,
  stressAccuracy = 0,
  feedback = ''
}) => {
  // Ensure accuracy is between 0 and 100
  const safeAccuracy = Math.max(0, Math.min(100, accuracy));
  const safePhoneticAccuracy = Math.max(0, Math.min(100, phoneticAccuracy));
  const safeRhythmAccuracy = Math.max(0, Math.min(100, rhythmAccuracy));
  const safeStressAccuracy = Math.max(0, Math.min(100, stressAccuracy));
  
  // Determine color based on accuracy
  const getColor = (value: number) => {
    if (value >= 80) return 'bg-green-500';
    if (value >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getTextColor = (value: number) => {
    if (value >= 80) return 'text-green-500';
    if (value >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="w-full">
      {/* Large centered score display */}
      <div className="flex justify-center mb-6">
        <div className={`text-6xl font-bold ${getTextColor(safeAccuracy)}`}>
          {safeAccuracy}
          <span className="text-3xl">/100</span>
        </div>
      </div>

      {/* Feedback */}
      {feedback && (
        <div className="mb-6 text-center">
          <p className="text-xl font-medium text-gray-800">{feedback}</p>
        </div>
      )}
      
      <div className="mb-8">
        <div className="mb-2 flex justify-between">
          <span className="text-sm font-medium text-gray-700">Overall Accuracy</span>
          <span className="text-sm font-medium text-gray-700">{safeAccuracy}%</span>
        </div>
        <div className="h-4 w-full bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full ${getColor(safeAccuracy)} transition-all duration-500 ease-out`} 
            style={{ width: `${safeAccuracy}%` }}
          ></div>
        </div>
      </div>

      {/* Detailed metrics */}
      <div className="space-y-4">
        <div>
          <div className="mb-1 flex justify-between">
            <span className="text-sm font-medium text-gray-700">Phonetic Accuracy</span>
            <span className="text-sm font-medium text-gray-700">{safePhoneticAccuracy}%</span>
          </div>
          <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full ${getColor(safePhoneticAccuracy)} transition-all duration-500 ease-out`} 
              style={{ width: `${safePhoneticAccuracy}%` }}
            ></div>
          </div>
        </div>

        <div>
          <div className="mb-1 flex justify-between">
            <span className="text-sm font-medium text-gray-700">Rhythm Accuracy</span>
            <span className="text-sm font-medium text-gray-700">{safeRhythmAccuracy}%</span>
          </div>
          <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full ${getColor(safeRhythmAccuracy)} transition-all duration-500 ease-out`} 
              style={{ width: `${safeRhythmAccuracy}%` }}
            ></div>
          </div>
        </div>

        <div>
          <div className="mb-1 flex justify-between">
            <span className="text-sm font-medium text-gray-700">Stress Accuracy</span>
            <span className="text-sm font-medium text-gray-700">{safeStressAccuracy}%</span>
          </div>
          <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full ${getColor(safeStressAccuracy)} transition-all duration-500 ease-out`} 
              style={{ width: `${safeStressAccuracy}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PronunciationMeter; 