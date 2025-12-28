import React from 'react';
import { Terminal, Code, Database, Cpu, Coffee, Hash, Smartphone, Box, Gem, Globe } from 'lucide-react';

interface OnboardingProps {
  onSelectLanguage: (lang: string) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onSelectLanguage }) => {
  const languages = [
    { name: 'HTML', icon: <Globe className="w-8 h-8" />, color: 'bg-orange-600' },
    { name: 'Python', icon: <Terminal className="w-8 h-8" />, color: 'bg-blue-500' },
    { name: 'JavaScript', icon: <Code className="w-8 h-8" />, color: 'bg-yellow-500' },
    { name: 'SQL', icon: <Database className="w-8 h-8" />, color: 'bg-green-500' },
    { name: 'C++', icon: <Cpu className="w-8 h-8" />, color: 'bg-red-500' },
    { name: 'Java', icon: <Coffee className="w-8 h-8" />, color: 'bg-orange-500' },
    { name: 'C#', icon: <Hash className="w-8 h-8" />, color: 'bg-purple-500' },
    { name: 'Swift', icon: <Smartphone className="w-8 h-8" />, color: 'bg-sky-500' },
    { name: 'Go', icon: <Box className="w-8 h-8" />, color: 'bg-cyan-500' },
    { name: 'Ruby', icon: <Gem className="w-8 h-8" />, color: 'bg-pink-500' },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-6xl w-full text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
          Bienvenido a CodeWorld
        </h1>
        <p className="text-xl text-slate-300 mb-12">
          Elige tu camino. ¿Qué lenguaje quieres dominar hoy?
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {languages.map((lang) => (
            <button
              key={lang.name}
              onClick={() => onSelectLanguage(lang.name)}
              className="group relative flex flex-col items-center justify-center p-6 bg-slate-800 rounded-2xl hover:bg-slate-700 transition-all border-2 border-transparent hover:border-green-400 hover:-translate-y-1"
            >
              <div className={`p-4 rounded-xl ${lang.color} bg-opacity-20 mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                <div className="text-white">
                  {lang.icon}
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold mb-2">{lang.name}</h3>
                <span className="text-xs text-slate-400 uppercase tracking-widest font-bold group-hover:text-green-300">Comenzar</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};