import React from 'react';
import { UserProgress } from '../types';
import { Map, Award, Briefcase, Heart, Zap, Flame } from 'lucide-react';

interface SidebarProps {
  progress: UserProgress;
  activeTab: string;
  onNavigate: (tab: string) => void;
  userLanguage: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ progress, activeTab, onNavigate, userLanguage }) => {
  const navItems = [
    { id: 'map', icon: Map, label: 'Aprender' },
    { id: 'tools', icon: Briefcase, label: 'Herramientas IA' },
    { id: 'certificate', icon: Award, label: 'Logros' },
  ];

  return (
    <div className="hidden md:flex flex-col w-64 border-r bg-white h-full p-4 z-20">
      <div className="mb-8 px-4">
        <h1 className="text-2xl font-bold text-green-500 tracking-tighter">CodeWorld</h1>
        <p className="text-xs text-slate-400 uppercase font-bold tracking-widest mt-1">{userLanguage}</p>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex items-center w-full p-3 rounded-xl transition-all font-bold uppercase tracking-widest text-sm ${
              activeTab === item.id 
                ? 'bg-blue-50 text-blue-500 border-2 border-blue-200' 
                : 'text-slate-500 hover:bg-slate-100 border-2 border-transparent'
            }`}
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="space-y-4 mt-auto border-t pt-6">
        <div className="flex items-center justify-between px-2 text-slate-600 font-bold">
           <div className="flex items-center text-red-500">
               <Heart className="w-5 h-5 fill-current mr-2" /> 
               {progress.hearts}
           </div>
           <div className="flex items-center text-yellow-500">
               <Zap className="w-5 h-5 fill-current mr-2" /> 
               {progress.xp} XP
           </div>
        </div>
        <div className="flex items-center justify-center p-3 bg-orange-50 rounded-xl border-2 border-orange-100 text-orange-500 font-bold">
            <Flame className="w-5 h-5 mr-2 fill-current" />
            Racha: {progress.streak} días
        </div>
      </div>
    </div>
  );
};