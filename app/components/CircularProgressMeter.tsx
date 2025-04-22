import React, { useEffect, useState } from 'react';

interface ProgressItemProps {
  value: number;
  label: string;
  color: string;
  maxValue?: number;
}

interface CircularProgressMeterProps {
  items: ProgressItemProps[];
  title?: string;
  subtitle?: string;
}

const CircularProgressItem: React.FC<ProgressItemProps> = ({ 
  value, 
  label, 
  color,
  maxValue = 100 
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  
  // Define preset colors with their RGB values for better glow
  const colorMap: Record<string, { rgb: string, hex: string }> = {
    green: { rgb: '0, 255, 0', hex: '#00ff00' },
    red: { rgb: '255, 0, 0', hex: '#ff0000' },
    blue: { rgb: '0, 149, 255', hex: '#0095ff' },
    pink: { rgb: '255, 0, 149', hex: '#ff0095' },
    yellow: { rgb: '255, 255, 0', hex: '#ffff00' },
    orange: { rgb: '255, 165, 0', hex: '#ffa500' }
  };
  
  // Function to get dynamic color based on score
  const getDynamicColor = () => {
    if (value >= 90) return colorMap.green;
    if (value >= 80) return { rgb: '150, 255, 0', hex: '#96ff00' };
    if (value >= 70) return { rgb: '200, 255, 0', hex: '#c8ff00' }; 
    if (value >= 60) return colorMap.yellow;
    if (value >= 50) return colorMap.orange;
    if (value >= 40) return { rgb: '255, 100, 0', hex: '#ff6400' };
    return colorMap.red;
  };
  
  // Use either predefined color or dynamic color based on score
  const colorInfo = color === 'dynamic' ? getDynamicColor() : (colorMap[color] || colorMap.blue);
  const percentage = (value / maxValue) * 100;
  
  // Calculate the coordinates for the SVG arc
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  // Animate value counting up
  useEffect(() => {
    const duration = 2000; // 2 seconds animation
    const startTime = Date.now();
    
    const animateValue = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function
      const easedProgress = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      
      setDisplayValue(Math.round(value * easedProgress));
      
      if (progress < 1) {
        requestAnimationFrame(animateValue);
      }
    };
    
    requestAnimationFrame(animateValue);
  }, [value]);

  return (
    <div className="circular-progress-item">
      <div className="relative flex items-center justify-center w-40 h-40">
        {/* Glow effect base */}
        <div 
          className="absolute w-full h-full rounded-full opacity-20"
          style={{
            background: `radial-gradient(circle, rgba(${colorInfo.rgb}, 0.6) 0%, rgba(0,0,0,0) 70%)`,
          }}
        />
        
        {/* Background circle with dashed strokes */}
        <svg className="absolute w-full h-full" viewBox="0 0 200 200">
          <circle 
            cx="100" 
            cy="100" 
            r={radius} 
            fill="transparent" 
            stroke="#333" 
            strokeWidth="8"
            strokeDasharray="3,3"
            transform="rotate(-90, 100, 100)"
          />
        </svg>
        
        {/* Progress circle with glow effect */}
        <svg 
          className="absolute w-full h-full" 
          viewBox="0 0 200 200" 
          style={{filter: `drop-shadow(0 0 6px rgba(${colorInfo.rgb}, 0.8))`}}
        >
          <circle 
            cx="100" 
            cy="100" 
            r={radius} 
            fill="transparent" 
            stroke={colorInfo.hex} 
            strokeWidth="8" 
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform="rotate(-90, 100, 100)"
          />
        </svg>
        
        {/* Display value */}
        <div className="flex flex-col items-center justify-center z-10">
          <div className="text-5xl font-bold text-white">{displayValue}<span className="text-2xl">%</span></div>
          <div className="text-xl text-center font-medium mt-1 text-white">{label}</div>
        </div>
      </div>
    </div>
  );
};

const CircularProgressMeter: React.FC<CircularProgressMeterProps> = ({ 
  items,
  title = "Pronunciation Metrics",
  subtitle = "German Accuracy"
}) => {
  return (
    <div className="circular-progress-meter-container flex flex-col items-center bg-gray-900 p-8 rounded-xl">
      <h2 className="text-4xl font-bold text-white mb-10">{title}</h2>
      
      <div className="flex flex-wrap justify-center gap-8 mb-10">
        {items.map((item, index) => (
          <CircularProgressItem 
            key={index}
            value={item.value}
            label={item.label}
            color={item.color === 'auto' ? 'dynamic' : item.color}
            maxValue={item.maxValue}
          />
        ))}
      </div>
      
      <div className="text-2xl text-center text-gray-300">
        {subtitle} <span className="text-green-500 font-bold">Speedometer</span>
      </div>
    </div>
  );
};

export default CircularProgressMeter; 