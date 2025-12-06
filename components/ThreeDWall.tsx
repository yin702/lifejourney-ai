import React, { useEffect, useState } from 'react';
import { TimelineSlot } from '../types';

interface ThreeDWallProps {
  items: TimelineSlot[];
}

const ThreeDWall: React.FC<ThreeDWallProps> = ({ items }) => {
  const [rotation, setRotation] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  // Filter only items that have images
  const validItems = items.filter(item => item.image);
  const count = validItems.length;

  // Auto-rotate effect
  useEffect(() => {
    if (count === 0 || isPaused) return;
    
    const interval = setInterval(() => {
      setRotation(prev => prev - 0.2); // Slowly rotate left
    }, 20);

    return () => clearInterval(interval);
  }, [count, isPaused]);

  // Calculate radius based on number of items to ensure they form a circle without overlapping too much
  // width of card approx 220px (w-56)
  // Circumference ~= count * 240
  // r = C / 2pi
  const radius = count > 0 ? Math.max(300, (count * 240) / (2 * Math.PI)) : 0;

  if (count === 0) return null;

  return (
    <div className="w-full h-[600px] flex items-center justify-center overflow-hidden bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 relative perspective-1000">
        
      {/* Stage */}
      <div 
        className="relative w-56 h-80 preserve-3d transition-transform duration-100 ease-linear"
        style={{ 
          transform: `perspective(1000px) rotateY(${rotation}deg)`,
          transformStyle: 'preserve-3d' 
        }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {validItems.map((item, index) => {
          const angle = (360 / count) * index;
          return (
            <div
              key={item.age}
              className="absolute top-0 left-0 w-full h-full rounded-xl border-2 border-white/20 shadow-[0_0_20px_rgba(0,0,0,0.5)] bg-black/80 overflow-hidden backface-visible"
              style={{
                transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
              }}
            >
               <img 
                 src={item.image!} 
                 alt={`Age ${item.age}`} 
                 className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity"
               />
               <div className="absolute bottom-0 w-full bg-black/60 p-2 text-center backdrop-blur-sm">
                 <p className="text-white font-cinzel text-lg">{item.age} Years</p>
               </div>
               
               {/* Reflection effect (pseudo) */}
               <div className="absolute top-full left-0 w-full h-full scale-y-[-1] opacity-20 bg-gradient-to-t from-transparent to-white/30 pointer-events-none mask-image-gradient">
                  <img src={item.image!} alt="" className="w-full h-full object-cover blur-[2px]" />
               </div>
            </div>
          );
        })}
      </div>
      
      {/* Floor glow */}
      <div className="absolute bottom-[-100px] w-[800px] h-[800px] bg-purple-900/20 rounded-full blur-[100px] transform rotate-x-90 pointer-events-none" />
    </div>
  );
};

export default ThreeDWall;