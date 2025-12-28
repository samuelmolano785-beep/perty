import React, { useState } from 'react';
import { LiveTutor } from './LiveTutor';
import { generateConceptVideo, searchTechNews, findTechEvents } from '../services/geminiService';
import { Mic, Search, Video, MapPin, Newspaper, Loader2, PlayCircle } from 'lucide-react';

interface ToolsDashboardProps {
  language: string;
}

export const ToolsDashboard: React.FC<ToolsDashboardProps> = ({ language }) => {
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleGenVideo = async () => {
    setLoading(true);
    const url = await generateConceptVideo("Object Oriented Programming", language);
    setResult({ type: 'video', url });
    setLoading(false);
  };

  const handleNews = async () => {
    setLoading(true);
    const data = await searchTechNews(language + " tutoriales nuevos");
    setResult({ type: 'news', data });
    setLoading(false);
  };
  
  const handleMap = async () => {
      setLoading(true);
      if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(async (pos) => {
             const text = await findTechEvents({ 
                 lat: pos.coords.latitude, 
                 lng: pos.coords.longitude 
             });
             setResult({ type: 'text', text });
             setLoading(false);
          });
      }
  };

  return (
    <div className="p-6 h-full overflow-y-auto bg-slate-50">
      <h2 className="text-3xl font-bold mb-6 text-slate-800">Herramientas IA</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <ToolCard 
          icon={<Mic className="w-8 h-8 text-white"/>}
          color="bg-purple-500"
          title="Tutor en Vivo"
          desc="Habla con la IA en tiempo real."
          onClick={() => setActiveTool('live')}
        />
        <ToolCard 
          icon={<Video className="w-8 h-8 text-white"/>}
          color="bg-pink-500"
          title="Video Concepto"
          desc="Genera videos educativos con Veo."
          onClick={handleGenVideo}
        />
        <ToolCard 
          icon={<Newspaper className="w-8 h-8 text-white"/>}
          color="bg-blue-500"
          title="Noticias Tech"
          desc="Lo último sobre tu lenguaje."
          onClick={handleNews}
        />
        <ToolCard 
            icon={<MapPin className="w-8 h-8 text-white" />}
            color="bg-green-500"
            title="Eventos Cerca"
            desc="Hackathons y meetups."
            onClick={handleMap}
        />
      </div>

      {activeTool === 'live' && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden relative">
                <button onClick={() => setActiveTool(null)} className="absolute top-4 right-4 z-10 p-2 bg-slate-100 rounded-full">✕</button>
                <LiveTutor />
            </div>
        </div>
      )}

      {loading && (
          <div className="flex items-center justify-center p-12">
              <Loader2 className="animate-spin w-10 h-10 text-slate-400" />
              <span className="ml-4 text-slate-500 font-bold">La IA está pensando...</span>
          </div>
      )}

      {result && !loading && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 animate-in fade-in slide-in-from-bottom-4">
          <h3 className="text-xl font-bold mb-4 border-b pb-2">Resultado</h3>
          
          {result.type === 'video' && (
            <video src={result.url} controls autoPlay className="w-full rounded-lg aspect-video bg-black" />
          )}

          {result.type === 'news' && (
            <div>
               <p className="whitespace-pre-wrap text-slate-700">{result.data.text}</p>
               <div className="mt-4 flex flex-wrap gap-2">
                   {result.data.links.map((link: string, i: number) => (
                       <a key={i} href={link} target="_blank" rel="noreferrer" className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded truncate max-w-[200px]">{link}</a>
                   ))}
               </div>
            </div>
          )}
          
          {result.type === 'text' && (
              <div className="prose text-slate-700">
                  <p>{result.text}</p>
              </div>
          )}
        </div>
      )}
    </div>
  );
};

const ToolCard = ({ icon, color, title, desc, onClick }: any) => (
  <button onClick={onClick} className="flex flex-col items-start p-6 bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:-translate-y-1 transition-all text-left group">
    <div className={`p-4 rounded-xl ${color} shadow-lg mb-4 group-hover:scale-110 transition-transform`}>
      {icon}
    </div>
    <h3 className="text-lg font-bold text-slate-800">{title}</h3>
    <p className="text-slate-500 text-sm mt-1">{desc}</p>
  </button>
);
