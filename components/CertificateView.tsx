import React, { useState } from 'react';
import { UserProgress } from '../types';
import { generateCertificate } from '../services/geminiService';
import { Loader2, Download, Share2, Lock, CheckCircle } from 'lucide-react';

interface CertificateViewProps {
  progress: UserProgress;
  language: string;
}

export const CertificateView: React.FC<CertificateViewProps> = ({ progress, language }) => {
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeCertType, setActiveCertType] = useState<'Basic' | 'Expert' | null>(null);

  // Define unlock conditions
  // Syllabus: 1-9 (Basic), 10-20 (Expert)
  const isBasicUnlocked = progress.currentLevelId > 9;
  const isExpertUnlocked = progress.currentLevelId > 20;

  const handleGenerate = async (type: 'Basic' | 'Expert') => {
    setLoading(true);
    setActiveCertType(type);
    const url = await generateCertificate("Estudiante", type, language);
    setImgUrl(url);
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full p-8 bg-slate-50 overflow-y-auto">
        <div className="max-w-4xl w-full mx-auto">
            <h2 className="text-3xl font-bold text-slate-800 mb-2 text-center">Tus Certificados</h2>
            <p className="text-slate-500 mb-12 text-center">Desbloquea pruebas de tu conocimiento impulsadas por IA.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                {/* Basic Certificate Card */}
                <div className={`p-6 rounded-2xl border-2 transition-all relative overflow-hidden ${isBasicUnlocked ? 'bg-white border-yellow-400 shadow-lg' : 'bg-slate-200 border-slate-300 opacity-80'}`}>
                    <div className="flex flex-col items-center text-center z-10 relative">
                        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mb-4 text-4xl">
                            {isBasicUnlocked ? '📜' : <Lock className="w-8 h-8 text-slate-400"/>}
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Certificado Básico</h3>
                        <p className="text-sm text-slate-500 mb-6">Completa el Nivel 9 para demostrar tus fundamentos.</p>
                        
                        <button 
                            disabled={!isBasicUnlocked}
                            onClick={() => handleGenerate('Basic')}
                            className={`px-6 py-2 rounded-xl font-bold transition-all ${
                                isBasicUnlocked 
                                ? 'bg-yellow-500 text-white hover:bg-yellow-600 shadow-md hover:scale-105' 
                                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                            }`}
                        >
                            {isBasicUnlocked ? 'Generar Certificado' : 'Bloqueado'}
                        </button>
                    </div>
                </div>

                {/* Expert Certificate Card */}
                <div className={`p-6 rounded-2xl border-2 transition-all relative overflow-hidden ${isExpertUnlocked ? 'bg-white border-purple-500 shadow-lg' : 'bg-slate-200 border-slate-300 opacity-80'}`}>
                    <div className="flex flex-col items-center text-center z-10 relative">
                         <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-4 text-4xl">
                            {isExpertUnlocked ? '🎓' : <Lock className="w-8 h-8 text-slate-400"/>}
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Certificado Experto</h3>
                        <p className="text-sm text-slate-500 mb-6">Completa el Nivel 20 y domina el lenguaje por completo.</p>
                        
                        <button 
                            disabled={!isExpertUnlocked}
                            onClick={() => handleGenerate('Expert')}
                            className={`px-6 py-2 rounded-xl font-bold transition-all ${
                                isExpertUnlocked 
                                ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-md hover:scale-105' 
                                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                            }`}
                        >
                            {isExpertUnlocked ? 'Generar Certificado' : 'Bloqueado'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Generated View Area */}
            {(loading || imgUrl) && (
                <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 animate-in slide-in-from-bottom-10">
                    <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                        {loading ? <Loader2 className="animate-spin mr-2"/> : <CheckCircle className="text-green-500 mr-2"/>}
                        {loading ? `Diseñando Certificado ${activeCertType}...` : `Tu Certificado ${activeCertType}`}
                    </h3>

                    {imgUrl && (
                        <div className="flex flex-col items-center">
                            <img src={imgUrl} alt="Certificate" className="w-full max-w-2xl rounded-lg shadow-2xl mb-8 border-8 border-slate-50" />
                            <div className="flex justify-center gap-4">
                                <a href={imgUrl} download={`certificado-${language}-${activeCertType}.png`} className="flex items-center px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors">
                                    <Download className="w-5 h-5 mr-2" /> Descargar Imagen
                                </a>
                                <button className="flex items-center px-6 py-3 bg-blue-100 text-blue-600 rounded-xl font-bold hover:bg-blue-200 transition-colors">
                                    <Share2 className="w-5 h-5 mr-2" /> Compartir
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    </div>
  );
};