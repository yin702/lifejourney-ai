import React, { useRef } from 'react';
import { TimelineSlot } from '../types';

interface TimelineGridProps {
  slots: TimelineSlot[];
  onUpload: (age: number, file: File) => void;
  onRemove: (age: number) => void;
}

const TimelineGrid: React.FC<TimelineGridProps> = ({ slots, onUpload, onRemove }) => {
  const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

  const handleFileChange = (age: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUpload(age, e.target.files[0]);
    }
  };

  const triggerUpload = (age: number) => {
    fileInputRefs.current[age]?.click();
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4">
      {slots.map((slot) => (
        <div 
          key={slot.age} 
          className={`relative group rounded-xl overflow-hidden border-2 transition-all duration-300 ${
            slot.image 
              ? slot.isGenerated ? 'border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]' : 'border-teal-500 shadow-[0_0_15px_rgba(20,184,166,0.5)]'
              : 'border-slate-700 hover:border-slate-500 border-dashed'
          } bg-slate-800/50 aspect-[3/4] flex flex-col`}
        >
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-3 z-10 flex justify-between items-center">
            <span className="text-white font-bold text-lg drop-shadow-md">{slot.age} Years Old</span>
            {slot.isGenerated && (
              <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">AI Generated</span>
            )}
            {!slot.isGenerated && slot.image && (
              <span className="text-xs bg-teal-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">Original</span>
            )}
          </div>

          {/* Content Area */}
          <div className="flex-1 w-full h-full relative flex items-center justify-center">
            {slot.isLoading ? (
              <div className="flex flex-col items-center gap-2 text-purple-300 animate-pulse">
                <svg className="animate-spin h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-sm">Dreaming...</span>
              </div>
            ) : slot.image ? (
              <>
                <img 
                  src={slot.image} 
                  alt={`Age ${slot.age}`} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                />
                {!slot.isGenerated && (
                   <button 
                     onClick={() => onRemove(slot.age)}
                     className="absolute bottom-3 right-3 bg-red-500/80 hover:bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                     title="Remove photo"
                   >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                     </svg>
                   </button>
                )}
              </>
            ) : (
              <button 
                onClick={() => triggerUpload(slot.age)}
                className="flex flex-col items-center gap-2 text-slate-400 hover:text-teal-400 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-semibold">Upload Photo</span>
                <span className="text-xs text-slate-500">Age {slot.age}</span>
              </button>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={(el) => { fileInputRefs.current[slot.age] = el }}
            onChange={(e) => handleFileChange(slot.age, e)}
          />
        </div>
      ))}
    </div>
  );
};

export default TimelineGrid;