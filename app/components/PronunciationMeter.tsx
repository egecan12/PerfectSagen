import React, { useEffect, useState } from 'react';

interface PronunciationMeterProps {
  accuracy: number;
  phoneticAccuracy?: number;
  rhythmAccuracy?: number;
  stressAccuracy?: number;
  feedback?: string;
}

// Odometer component to display score in a mechanical style
const OdometerDisplay: React.FC<{ value: number }> = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(0);
  
  // Animate the odometer value
  useEffect(() => {
    const duration = 2000; // 2 seconds animation
    const start = displayValue;
    const end = value;
    const range = end - start;
    const startTime = Date.now();
    
    const animateValue = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for a more mechanical feel
      const easedProgress = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      
      setDisplayValue(Math.round(start + range * easedProgress));
      
      if (progress < 1) {
        requestAnimationFrame(animateValue);
      }
    };
    
    requestAnimationFrame(animateValue);
  }, [value]);
  
  // Convert number to array of digits
  const digits = displayValue.toString().padStart(3, '0').split('');
  
  return (
    <div className="flex flex-col items-center">
      <div className="odometer mb-2">
        {digits.map((digit, index) => (
          <div key={index} className="odometer-digit">
            {digit}
          </div>
        ))}
      </div>
      <div className="text-lg font-medium text-blue-400">points</div>
    </div>
  );
};

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

  return (
    <div className="w-full">
      {/* Odometer score display */}
      <div className="flex justify-center mb-6">
        <OdometerDisplay value={safeAccuracy} />
      </div>

      {/* Feedback */}
      {feedback && (
        <div className="mb-6 text-center">
          <p className="text-lg font-medium text-blue-300">{feedback}</p>
        </div>
      )}
      
      <div className="mb-8">
        <div className="mb-2 flex justify-between">
          <span className="text-sm font-medium text-blue-300">Overall Accuracy</span>
          <span className="text-sm font-medium text-blue-300">{safeAccuracy}%</span>
        </div>
        <div className="h-4 w-full bg-slate-700 rounded-full overflow-hidden">
          <div 
            className={`h-full ${getColor(safeAccuracy)} transition-all duration-1000 ease-out`} 
            style={{ width: `${safeAccuracy}%` }}
          ></div>
        </div>
      </div>

      {/* Detailed metrics */}
      <div className="space-y-4">
        <div>
          <div className="mb-1 flex justify-between">
            <span className="text-sm font-medium text-blue-300">Phonetic Accuracy</span>
            <span className="text-sm font-medium text-blue-300">{safePhoneticAccuracy}%</span>
          </div>
          <div className="h-3 w-full bg-slate-700 rounded-full overflow-hidden">
            <div 
              className={`h-full ${getColor(safePhoneticAccuracy)} transition-all duration-700 ease-out`} 
              style={{ width: `${safePhoneticAccuracy}%` }}
            ></div>
          </div>
        </div>

        <div>
          <div className="mb-1 flex justify-between">
            <span className="text-sm font-medium text-blue-300">Rhythm Accuracy</span>
            <span className="text-sm font-medium text-blue-300">{safeRhythmAccuracy}%</span>
          </div>
          <div className="h-3 w-full bg-slate-700 rounded-full overflow-hidden">
            <div 
              className={`h-full ${getColor(safeRhythmAccuracy)} transition-all duration-700 ease-out`} 
              style={{ width: `${safeRhythmAccuracy}%` }}
            ></div>
          </div>
        </div>

        <div>
          <div className="mb-1 flex justify-between">
            <span className="text-sm font-medium text-blue-300">Stress Accuracy</span>
            <span className="text-sm font-medium text-blue-300">{safeStressAccuracy}%</span>
          </div>
          <div className="h-3 w-full bg-slate-700 rounded-full overflow-hidden">
            <div 
              className={`h-full ${getColor(safeStressAccuracy)} transition-all duration-700 ease-out`} 
              style={{ width: `${safeStressAccuracy}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PronunciationMeter; 