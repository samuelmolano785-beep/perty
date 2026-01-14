
import React, { useState } from 'react';
import { Terminal, Code, Database, Cpu, Coffee, Hash, Smartphone, Box, Gem, Globe, Brain, Rocket, Briefcase, Plane, Clock, Zap, Target } from 'lucide-react';

interface OnboardingProps {
  onComplete: (data: { language: string; motivation: string; goal: number }) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [motivation, setMotivation] = useState('');
  const [goal, setGoal] = useState(15);

  const motivations = [
    { id: 'career', label: 'Impulsar mi carrera', icon: <Briefcase className="w-6 h-6"/> },
    { id: 'brain', label: 'Entrenar mi cerebro', icon: <Brain className="w-6 h-6"/> },
    { id: 'hobby', label: 'Por pura diversión', icon: <Rocket className="w-6 h-6"/> },
    { id: 'travel', label: 'Crear proyectos', icon: <Plane className="w-6 h-6"/> },
  ];

  const goals = [
    { min: 5, label: 'Relajado', desc: '5 min / día' },
    { min: 15, label: 'Normal', desc: '15 min / día' },
    { min: 30, label: 'Serio', desc: '30 min / día' },
    { min: 60, label: 'Intenso', desc: '60 min / día' },
  ];

  const languages = [
    { name: 'HTML', icon: <Globe className="w-8 h-8" />, color: 'bg-orange-600' },
    { name: 'Python', icon: <Terminal className="w-8 h-8" />, color: 'bg-blue-500' },
    { name: 'JavaScript', icon: <Code className="w-8 h-8" />, color: 'bg-yellow-500' },
    { name: 'SQL', icon: <Database className="w-8 h-8" />, color: 'bg-green-500' },
    { name: 'C++', icon: <Cpu className="w-8 h-8" />, color: 'bg-red-500' },
    { name: 'Java', icon: <Coffee className="w-8 h-8" />, color: 'bg-orange-500' },
    { name: 'Swift', icon: <Smartphone className="w-8 h-8" />, color: 'bg-sky-500' },
  ];

  const handleNext = () => {
    setStep(prev => prev + 1);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-green-500/10 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[100px]"></div>

      <div className="max-w-4xl w-full relative z-10">
        
        {/* Progress Bar */}
        <div className="w-full h-2 bg-slate-800 rounded-full mb-12 overflow-hidden">
            <div 
                className="h-full bg-green-500 transition-all duration-500 ease-out" 
                style={{ width: `${(step / 3) * 100}%` }}
            ></div>
        </div>

        {/* STEP 1: MOTIVATION */}
        {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                <h1 className="text-3xl md:text-5xl font-bold mb-8 text-center">¿Qué te motiva a aprender a programar?</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                    {motivations.map((m) => (
                        <button
                            key={m.id}
                            onClick={() => { setMotivation(m.id); handleNext(); }}
                            className="flex items-center p-6 bg-slate-800 hover:bg-slate-700 border-2 border-slate-700 hover:border-green-500 rounded-2xl transition-all group text-left"
                        >
                            <div className="mr-4 text-slate-400 group-hover:text-green-400 transition-colors">
                                {m.icon}
                            </div>
                            <span className="text-lg font-bold">{m.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        )}

        {/* STEP 2: GOAL */}
        {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                <h1 className="text-3xl md:text-5xl font-bold mb-8 text-center">¿Cuánto tiempo vas a dedicarle?</h1>
                <div className="flex flex-col gap-4 max-w-lg mx-auto">
                    {goals.map((g) => (
                        <button
                            key={g.min}
                            onClick={() => { setGoal(g.min); handleNext(); }}
                            className="flex items-center justify-between p-5 bg-slate-800 hover:bg-slate-700 border-2 border-slate-700 hover:border-blue-500 rounded-2xl transition-all group"
                        >
                            <span className="text-lg font-bold">{g.label}</span>
                            <span className="text-slate-400 group-hover:text-blue-300 font-mono">{g.desc}</span>
                        </button>
                    ))}
                </div>
            </div>
        )}

        {/* STEP 3: LANGUAGE */}
        {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500 text-center">
                <h1 className="text-3xl md:text-5xl font-bold mb-4">Elige tu camino</h1>
                <p className="text-xl text-slate-400 mb-10">¿Qué tecnología quieres dominar?</p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {languages.map((lang) => (
                        <button
                            key={lang.name}
                            onClick={() => onComplete({ language: lang.name, motivation, goal })}
                            className="group relative flex flex-col items-center justify-center p-6 bg-slate-800 rounded-2xl hover:bg-slate-700 transition-all border-2 border-transparent hover:border-green-400 hover:-translate-y-1"
                        >
                            <div className={`p-4 rounded-xl ${lang.color} bg-opacity-20 mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                                <div className="text-white">
                                {lang.icon}
                                </div>
                            </div>
                            <div className="text-center">
                                <h3 className="text-xl font-bold mb-2">{lang.name}</h3>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};
