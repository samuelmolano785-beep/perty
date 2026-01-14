import React, { useState, useEffect } from 'react';
import { CourseLevel, LessonContent } from '../types';
import { generateLesson, checkCodeAnswer, textToSpeech, getAiHint } from '../services/geminiService';
import { X, Play, Loader2, Volume2, RotateCcw, Lightbulb, CheckCircle, AlertCircle, Sparkles, Globe, Menu, ChevronRight, LayoutList } from 'lucide-react';

interface LessonProps {
  level: CourseLevel;
  language: string;
  onComplete: (xp: number, passed: boolean) => void;
  onExit: () => void;
}

export const LessonOverlay: React.FC<LessonProps> = ({ level, language, onComplete, onExit }) => {
  const [content, setContent] = useState<LessonContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [userCode, setUserCode] = useState('');
  
  // States matching the UI image
  const [activeBottomTab, setActiveBottomTab] = useState<'tests' | 'console'>('tests');
  const [testStatus, setTestStatus] = useState<'idle' | 'running' | 'passed' | 'failed'>('idle');
  const [aiFeedback, setAiFeedback] = useState<string>('');
  const [consoleOutput, setConsoleOutput] = useState<string>('');
  
  const [errorLine, setErrorLine] = useState<number | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isGettingHint, setIsGettingHint] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // Load lesson
  useEffect(() => {
    generateLesson(language, level).then(data => {
      setContent(data);
      if (data.initialCode) setUserCode(data.initialCode);
      setLoading(false);
    });
  }, [level, language]);

  const handleGetHint = async () => {
    if (!content) return;
    setIsGettingHint(true);
    setActiveBottomTab('console');
    const hint = await getAiHint(language, content.question, userCode);
    setConsoleOutput(prev => prev + `\n\n🤖 Pista IA:\n${hint}\n`);
    setIsGettingHint(false);
  };

  const handleCheck = async () => {
    if (!content) return;
    setIsChecking(true);
    setTestStatus('running');
    setActiveBottomTab('tests');
    setErrorLine(null);
    setAiFeedback('');

    // Simulate a small delay for "running" effect
    await new Promise(r => setTimeout(r, 800));

    let passed = false;
    let feedback = "";
    let output = "";
    let errLine = 0;

    if (content.type === 'multiple_choice') {
      passed = selectedOption === content.correctAnswer;
      feedback = passed ? '¡Correcto! Muy bien.' : 'Ups, esa no es. Intenta de nuevo.';
      output = "Revisando respuesta...";
    } else {
      const result = await checkCodeAnswer(language, content.question, userCode);
      passed = result.passed;
      feedback = result.feedback;
      output = result.output;
      errLine = result.errorLine || 0;
    }

    setConsoleOutput(output);
    setAiFeedback(feedback);
    setTestStatus(passed ? 'passed' : 'failed');
    if (errLine > 0) setErrorLine(errLine);

    if (passed) {
        setTimeout(() => {
            onComplete(25, true); 
        }, 3000);
    }

    setIsChecking(false);
  };

  const playAudio = async () => {
    if (content?.theory) {
      const audioUrl = await textToSpeech(content.theory);
      if (audioUrl) new Audio(audioUrl).play();
    }
  };

  if (loading) return (
    <div className="fixed inset-0 bg-[#1e1e1e] z-50 flex flex-col items-center justify-center">
      <Loader2 className="animate-spin text-blue-500 w-12 h-12 mb-4"/>
      <div className="text-slate-400 font-mono text-sm">Cargando tu lección de {language}...</div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-[#1e1e1e] text-slate-300 font-sans z-50 flex flex-col overflow-hidden">
      
      {/* HEADER: Similar to "Texto y Formato" bar */}
      <div className="h-14 bg-[#252526] border-b border-[#1e1e1e] flex items-center justify-between px-4 shrink-0 shadow-md z-20">
          <div className="flex items-center gap-4">
             <button onClick={onExit} className="p-2 hover:bg-[#333] rounded-md transition-colors text-slate-400">
                <X className="w-5 h-5"/>
             </button>
             <div className="flex flex-col">
                 <h1 className="text-white font-bold text-sm tracking-wide">{level.title}</h1>
                 <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Nivel {level.id} • {language}</span>
             </div>
          </div>
          
          <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-orange-500 font-bold text-sm bg-[#1e1e1e] px-3 py-1 rounded-full border border-[#333]">
                  <span className="text-xs">🔥</span> 1
              </div>
              <div className="flex items-center gap-1 text-yellow-500 font-bold text-sm bg-[#1e1e1e] px-3 py-1 rounded-full border border-[#333]">
                  <span className="text-xs">💎</span> 25
              </div>
          </div>
      </div>

      {/* MAIN CONTENT: 3 COLUMNS */}
      <div className="flex-1 flex flex-row overflow-hidden">
        
        {/* COL 1: INSTRUCTIONS (Left Panel) */}
        <div className="w-[350px] bg-[#1e1e1e] border-r border-[#333] flex flex-col relative shrink-0">
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                
                {/* Title Section */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-white">Conceptos</h2>
                    <span className="text-[10px] bg-[#333] text-slate-400 px-2 py-1 rounded border border-[#444] font-bold">RESUMEN</span>
                </div>

                {/* Theory Content - Formatted specifically for readability */}
                <div className="space-y-4 mb-8">
                     <div 
                        className="text-slate-300 text-sm leading-relaxed instruction-content"
                        dangerouslySetInnerHTML={{ __html: content?.theory || '' }} 
                     />
                     <button onClick={playAudio} className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 mt-2 transition-colors">
                        <Volume2 className="w-4 h-4" /> Escuchar explicación
                     </button>
                </div>

                {/* Challenge Section */}
                <div className="mt-6">
                    <div className="flex items-center gap-2 text-slate-100 font-bold text-sm mb-3">
                        <Lightbulb className="w-4 h-4 text-yellow-500" />
                        Tu Misión <span className="text-[10px] bg-blue-900/50 text-blue-300 px-2 py-0.5 rounded-full ml-2">Fácil</span>
                    </div>
                    <div className="bg-[#252526] p-4 rounded-lg border-l-4 border-yellow-600 text-sm text-slate-300 shadow-sm">
                        {content?.question}
                    </div>
                </div>

                {/* Quiz Options if applicable */}
                {content?.type === 'multiple_choice' && (
                     <div className="mt-6 space-y-2">
                        {content.options?.map((opt, idx) => (
                            <button
                                key={idx}
                                onClick={() => setSelectedOption(opt)}
                                className={`w-full text-left p-3 rounded-md text-sm transition-all border ${
                                    selectedOption === opt 
                                    ? 'bg-[#007acc]/20 border-[#007acc] text-white' 
                                    : 'bg-[#252526] border-[#3e3e42] hover:border-slate-500'
                                }`}
                            >
                                <span className="font-mono text-slate-500 mr-2">{idx + 1}.</span>
                                {opt}
                            </button>
                        ))}
                     </div>
                )}
            </div>

            {/* Bottom "Done" Indicator */}
            <div className="p-4 border-t border-[#333] bg-[#1e1e1e]">
                <button className="w-full flex items-center justify-between bg-[#2d2d2d] hover:bg-[#333] text-green-500 p-3 rounded-lg font-bold text-sm border border-[#333] transition-all">
                   <span className="flex items-center"><CheckCircle className="w-4 h-4 mr-2" /> Estado: {testStatus === 'passed' ? '¡Completado!' : 'En progreso...'}</span>
                   <ChevronRight className="w-4 h-4 opacity-50"/>
                </button>
            </div>
        </div>

        {/* COL 2: EDITOR & TEST CASES (Middle Panel) */}
        <div className="flex-1 flex flex-col min-w-[400px] bg-[#1e1e1e] relative border-r border-[#333]">
            
            {/* Top Bar: Tabs */}
            <div className="h-9 bg-[#1e1e1e] flex items-center border-b border-[#333]">
                <div className="px-4 h-full bg-[#1e1e1e] border-t-2 border-transparent text-slate-400 text-xs flex items-center font-mono border-r border-[#333]">
                     mi_codigo.{language.toLowerCase().slice(0,3)}
                </div>
                 <div className="px-4 h-full bg-[#1e1e1e] border-t-2 border-[#007acc] text-white text-xs flex items-center font-mono font-bold bg-[#252526] border-r border-[#333]">
                    {language.toUpperCase()}
                </div>
            </div>

            {/* Code Editor */}
            <div className="flex-1 relative bg-[#1e1e1e]">
                {/* Line Numbers */}
                <div className="absolute left-0 top-0 bottom-0 w-12 bg-[#1e1e1e] text-[#555] text-xs font-mono text-right pr-3 pt-4 select-none leading-6 border-r border-[#252526]">
                    {userCode.split('\n').map((_, i) => (
                        <div key={i} className="relative">
                            {i + 1}
                            {errorLine === (i + 1) && <div className="absolute right-[-8px] top-1.5 w-1.5 h-1.5 bg-red-500 rounded-full"></div>}
                        </div>
                    ))}
                </div>
                {/* Textarea */}
                <textarea 
                    value={userCode}
                    onChange={(e) => setUserCode(e.target.value)}
                    className="absolute left-12 right-0 top-0 bottom-0 bg-[#1e1e1e] text-[#d4d4d4] p-4 pt-4 font-mono text-sm resize-none focus:outline-none leading-6 selection:bg-[#264f78]"
                    spellCheck={false}
                />
                
                {/* Floating Actions */}
                <div className="absolute bottom-6 right-6 flex gap-3 z-30">
                     <button 
                        onClick={handleGetHint}
                        disabled={isGettingHint}
                        className="flex items-center px-4 py-2 bg-[#2d2d2d] hover:bg-[#3a3a3a] text-slate-300 text-xs font-bold rounded shadow-lg border border-[#3e3e42] transition-colors"
                     >
                        {isGettingHint ? <Loader2 className="w-3 h-3 animate-spin mr-2"/> : <Sparkles className="w-3 h-3 mr-2 text-blue-400"/>}
                        Ayuda IA
                     </button>

                     <button 
                        onClick={handleCheck}
                        disabled={isChecking}
                        className="flex items-center px-5 py-2 bg-[#007acc] hover:bg-[#0063a5] text-white text-xs font-bold rounded shadow-lg transition-colors"
                     >
                        {isChecking ? <Loader2 className="w-3 h-3 animate-spin mr-2"/> : <Play className="w-3 h-3 mr-2 fill-current"/>}
                        Probar Código
                     </button>
                </div>
            </div>

            {/* Bottom Panel: Test Cases & Console */}
            <div className="h-[220px] bg-[#1e1e1e] border-t border-[#333] flex flex-col">
                <div className="flex h-9 border-b border-[#333] bg-[#1e1e1e]">
                    <button 
                        onClick={() => setActiveBottomTab('tests')}
                        className={`px-4 text-[11px] font-bold uppercase tracking-wider transition-colors border-b-2 ${
                            activeBottomTab === 'tests' 
                            ? 'text-white border-[#007acc]' 
                            : 'text-slate-500 border-transparent hover:text-slate-300'
                        }`}
                    >
                        PRUEBAS
                    </button>
                    <button 
                        onClick={() => setActiveBottomTab('console')}
                        className={`px-4 text-[11px] font-bold uppercase tracking-wider transition-colors border-b-2 ${
                            activeBottomTab === 'console' 
                            ? 'text-white border-[#007acc]' 
                            : 'text-slate-500 border-transparent hover:text-slate-300'
                        }`}
                    >
                        RESULTADOS
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-0 bg-[#1e1e1e]">
                    {activeBottomTab === 'tests' ? (
                        <div className="p-4">
                            {/* Structured Test Case like Image */}
                            <div className="mb-2 text-xs text-slate-500 font-bold uppercase">Estado de la Prueba</div>
                            
                            <div className="bg-[#252526] p-3 rounded-md border border-[#333] font-mono text-xs text-slate-300 mb-4 flex items-center">
                                <span className="bg-[#333] px-1.5 py-0.5 rounded text-slate-400 mr-2">Check</span>
                                <span>Verificando tu solución...</span>
                            </div>

                            <div className="mb-2 text-xs text-slate-500 font-bold uppercase">Análisis</div>

                            {testStatus === 'idle' ? (
                                <div className="text-xs text-slate-600 italic">Pulsa "Probar Código" para ver qué pasa.</div>
                            ) : testStatus === 'running' ? (
                                <div className="flex items-center text-blue-400 text-xs"><Loader2 className="w-3 h-3 animate-spin mr-2"/> Pensando...</div>
                            ) : (
                                <div className="font-mono text-sm">
                                     <div className="flex items-start gap-4">
                                        <div className="flex-1">
                                            <div className="text-xs text-slate-500 mb-1">Esperábamos esto:</div>
                                            <div className="text-green-400 font-bold">Bien hecho</div>
                                        </div>
                                        <div className="flex-1 border-l border-[#333] pl-4">
                                            <div className="text-xs text-slate-500 mb-1">Pasó esto:</div>
                                            <div className={testStatus === 'passed' ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                                                {testStatus === 'passed' ? '¡Éxito!' : 'Ups...'}
                                            </div>
                                        </div>
                                     </div>
                                     {aiFeedback && (
                                         <div className={`mt-3 p-2 rounded text-xs border ${testStatus === 'passed' ? 'bg-green-900/10 border-green-900/30 text-green-300' : 'bg-red-900/10 border-red-900/30 text-red-300'}`}>
                                            {aiFeedback}
                                         </div>
                                     )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="p-4 font-mono text-xs text-[#d4d4d4] whitespace-pre-wrap">
                            {consoleOutput || <span className="text-slate-600">No hay resultados todavía.</span>}
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* COL 3: WEB PREVIEW (Right Panel) */}
        <div className="w-[35%] min-w-[300px] bg-white flex flex-col border-l border-[#333]">
            {/* Browser Header */}
            <div className="h-9 bg-[#f3f3f3] border-b border-[#e5e5e5] flex items-center justify-between px-3">
                 <div className="flex items-center text-xs font-bold text-slate-600">
                    <Globe className="w-3 h-3 mr-2 text-slate-400" /> 
                    Navegador
                 </div>
                 <div className="flex gap-2">
                    <button 
                        onClick={() => setConsoleOutput('')} 
                        title="Reiniciar Vista" 
                        className="p-1 hover:bg-slate-200 rounded-md transition-colors"
                    >
                        <RotateCcw className="w-3 h-3 text-slate-400 hover:text-slate-600" />
                    </button>
                 </div>
            </div>
            
            {/* Preview Content */}
            <div className="flex-1 relative bg-white">
                 {content?.type === 'multiple_choice' ? (
                     <div className="flex flex-col items-center justify-center h-full text-slate-400 text-sm text-center p-8">
                         <LayoutList className="w-12 h-12 mb-4 opacity-20" />
                         <p>Modo Preguntas</p>
                         <p className="text-xs mt-2 opacity-60">La vista previa solo funciona cuando escribes código.</p>
                     </div>
                 ) : (
                     <div className="h-full w-full p-4 font-sans text-black">
                         {/* Render HTML Preview safely */}
                         {language.toLowerCase() === 'html' ? (
                             <iframe 
                                title="preview"
                                srcDoc={userCode}
                                className="w-full h-full border-0"
                                sandbox="allow-scripts"
                             />
                         ) : (
                             // Generic Output for non-visual langs
                             <div className="font-mono text-sm whitespace-pre-wrap text-slate-800">
                                 {consoleOutput || "Salida del programa..."}
                             </div>
                         )}
                     </div>
                 )}
            </div>
        </div>

      </div>
    </div>
  );
};