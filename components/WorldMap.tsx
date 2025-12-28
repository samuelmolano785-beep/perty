import React, { useEffect, useState, useRef } from 'react';
import { CourseLevel } from '../types';
import { generateSyllabus } from '../services/geminiService';
import { Lock, Check, Star, Trophy, Loader2, TreePine, Mountain, Cloud } from 'lucide-react';

interface WorldMapProps {
  currentLevelId: number;
  language: string;
  onLevelSelect: (level: CourseLevel) => void;
}

// Componente para decorar el mapa
const SceneryItem = ({ type, x, y, delay }: { type: 'tree' | 'mountain' | 'cloud', x: number, y: number, delay: number }) => {
  if (type === 'tree') {
    return (
      <div className="absolute text-green-700 opacity-80" style={{ left: `${x}%`, top: y, transform: `scale(${0.8 + Math.random() * 0.5})` }}>
        <TreePine className="w-12 h-12 fill-green-800" />
        <div className="w-8 h-2 bg-black opacity-20 rounded-full blur-sm mx-auto -mt-1"></div>
      </div>
    );
  }
  if (type === 'mountain') {
    return (
      <div className="absolute text-slate-500 opacity-60" style={{ left: `${x}%`, top: y, transform: `scale(${1.5 + Math.random()})` }}>
        <Mountain className="w-24 h-24 fill-slate-600" />
      </div>
    );
  }
  return (
    <div 
      className="absolute text-white opacity-40 animate-pulse" 
      style={{ 
        left: `${x}%`, 
        top: y, 
        animationDuration: `${10 + Math.random() * 10}s`,
        animationDelay: `${delay}s`
      }}
    >
      <Cloud className="w-16 h-16 fill-white" />
    </div>
  );
};

export const WorldMap: React.FC<WorldMapProps> = ({ currentLevelId, language, onLevelSelect }) => {
  const [levels, setLevels] = useState<CourseLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSyllabus = async () => {
      try {
        const data = await generateSyllabus(language);
        setLevels(data);
      } catch (e) {
        console.error("Failed to load syllabus", e);
      } finally {
        setLoading(false);
      }
    };
    fetchSyllabus();
  }, [language]);

  useEffect(() => {
    if (containerRef.current && levels.length > 0) {
       const activeNode = levels.find(l => l.id === currentLevelId);
       if (activeNode) {
         const y = activeNode.position.y;
         containerRef.current.scrollTop = y - window.innerHeight / 2 + 100;
       }
    }
  }, [levels, currentLevelId]);

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-green-400">
        <Loader2 className="w-12 h-12 text-white animate-spin mb-4" />
        <p className="text-white font-bold text-xl">Generando mundo para {language}...</p>
      </div>
    );
  }

  // Calculate dynamic height based on number of levels
  const mapHeight = Math.max(1500, levels.length * 120 + 200);

  return (
    <div ref={containerRef} className="h-full w-full bg-[#4ade80] overflow-y-auto relative pb-20 scroll-smooth">
      <style>{`
        @keyframes dash {
          to { stroke-dashoffset: -30; }
        }
        .animated-path {
          animation: dash 1s linear infinite;
        }
      `}</style>

      {/* Background Texture */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20 bg-[url('https://www.transparenttextures.com/patterns/grass.png')]"></div>
      
      {/* Decorative Scenery Generation */}
      {levels.map((l, i) => (
        <React.Fragment key={`scenery-${i}`}>
          {/* Random trees and mountains around the path */}
          <SceneryItem type="tree" x={Math.max(5, l.position.x - 20 - (Math.random() * 10))} y={l.position.y + 20} delay={0} />
          <SceneryItem type="tree" x={Math.min(90, l.position.x + 20 + (Math.random() * 10))} y={l.position.y - 40} delay={0} />
          {i % 3 === 0 && <SceneryItem type="mountain" x={l.position.x > 50 ? 10 : 80} y={l.position.y} delay={0} />}
          {i % 2 === 0 && <SceneryItem type="cloud" x={Math.random() * 80} y={l.position.y - 100} delay={i} />}
        </React.Fragment>
      ))}

      <div className="relative w-full max-w-2xl mx-auto py-20" style={{ height: mapHeight }}>
        {/* Road Path */}
        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 overflow-visible">
          <defs>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="rgba(0,0,0,0.3)"/>
            </filter>
          </defs>
          {levels.map((level, i) => {
            if (i === levels.length - 1) return null;
            const next = levels[i + 1];
            return (
              <g key={i}>
                {/* Path Shadow/Base */}
                <path 
                  d={`M ${level.position.x}% ${level.position.y} Q ${(level.position.x + next.position.x)/2} ${(level.position.y + next.position.y)/2} ${next.position.x}% ${next.position.y}`}
                  fill="none"
                  stroke="#a8a29e" 
                  strokeWidth="50" 
                  strokeLinecap="round"
                  filter="url(#shadow)"
                />
                {/* Path Surface */}
                <path 
                  d={`M ${level.position.x}% ${level.position.y} Q ${(level.position.x + next.position.x)/2} ${(level.position.y + next.position.y)/2} ${next.position.x}% ${next.position.y}`}
                  fill="none"
                  stroke="#d6d3d1" 
                  strokeWidth="40" 
                  strokeLinecap="round"
                />
                {/* Animated Markings */}
                <path 
                  d={`M ${level.position.x}% ${level.position.y} Q ${(level.position.x + next.position.x)/2} ${(level.position.y + next.position.y)/2} ${next.position.x}% ${next.position.y}`}
                  fill="none"
                  stroke="#fbbf24" 
                  strokeWidth="4" 
                  strokeLinecap="round"
                  strokeDasharray="15 15"
                  className="animated-path opacity-80"
                />
              </g>
            );
          })}
        </svg>

        {levels.map((level) => {
          const isUnlocked = level.id <= currentLevelId;
          const isCompleted = level.id < currentLevelId;
          const isCurrent = level.id === currentLevelId;

          let Icon = Star;
          let colorClass = "bg-green-500 border-green-600 ring-green-200 shadow-[0_8px_0_#15803d]";
          let sizeClass = "w-16 h-16";
          
          if (level.type.includes('checkpoint')) {
            Icon = Trophy;
            colorClass = "bg-yellow-400 border-yellow-600 ring-yellow-200 w-24 h-24 shadow-[0_10px_0_#ca8a04]";
            sizeClass = "w-24 h-24";
          } else if (level.type === 'challenge') {
             colorClass = "bg-purple-500 border-purple-600 ring-purple-200 shadow-[0_8px_0_#7e22ce]";
          }

          if (!isUnlocked) {
            colorClass = "bg-slate-400 border-slate-500 ring-slate-200 shadow-[0_8px_0_#64748b]";
            Icon = Lock;
          }

          return (
            <div 
              key={level.id}
              className="absolute transform -translate-x-1/2 z-10 flex flex-col items-center group"
              style={{ left: `${level.position.x}%`, top: level.position.y }}
            >
              <button
                disabled={!isUnlocked}
                onClick={() => onLevelSelect(level)}
                className={`
                  rounded-full transition-all duration-300
                  flex items-center justify-center text-white
                  border-b-4 active:border-b-0 active:translate-y-2
                  ${colorClass}
                  ${sizeClass}
                  ${isCurrent ? 'ring-4 scale-110 animate-bounce' : 'hover:scale-105'}
                `}
              >
                {isCompleted ? <Check className="w-8 h-8" /> : <Icon className="w-8 h-8" />}
              </button>
              
              {/* Level Title Label */}
              <div className="absolute top-full mt-3 transition-all duration-300 transform group-hover:-translate-y-1">
                 <div className="bg-white px-4 py-2 rounded-xl shadow-xl border-2 border-slate-100 text-sm font-bold text-slate-700 whitespace-nowrap z-20 relative">
                    {level.title}
                    {/* Little Triangle Pointer */}
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-white"></div>
                 </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}