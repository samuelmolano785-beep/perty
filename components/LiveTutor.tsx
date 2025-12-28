import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { Mic, MicOff } from 'lucide-react';

export const LiveTutor: React.FC = () => {
  const [active, setActive] = useState(false);
  const [status, setStatus] = useState('Listo para conectar');
  const [volume, setVolume] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const sessionRef = useRef<any>(null);

  // Audio Contexts
  const inputContextRef = useRef<AudioContext | null>(null);
  const outputContextRef = useRef<AudioContext | null>(null);
  
  const stopRef = useRef(false);

  useEffect(() => {
    return () => {
      stopRef.current = true;
      if (sessionRef.current) sessionRef.current.close();
      inputContextRef.current?.close();
      outputContextRef.current?.close();
    };
  }, []);

  const startSession = async () => {
    stopRef.current = false;
    setActive(true);
    setStatus('Conectando...');
    
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        // Setup Audio
        inputContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        outputContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        const sessionPromise = ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            config: {
                responseModalities: [Modality.AUDIO],
                systemInstruction: "You are a friendly, encouraging programming tutor. Keep responses concise and helpful. Speak Spanish.",
                speechConfig: {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
                }
            },
            callbacks: {
                onopen: () => {
                    setStatus('¡En línea! Habla conmigo.');
                    
                    // Input Stream Logic
                    const source = inputContextRef.current!.createMediaStreamSource(stream);
                    const processor = inputContextRef.current!.createScriptProcessor(4096, 1, 1);
                    
                    processor.onaudioprocess = (e) => {
                        if (stopRef.current) return;
                        const inputData = e.inputBuffer.getChannelData(0);
                        // Visualize volume
                        let sum = 0;
                        for(let i=0; i<inputData.length; i++) sum += inputData[i] * inputData[i];
                        setVolume(Math.sqrt(sum / inputData.length) * 100);

                        // Convert to PCM 16-bit
                        const l = inputData.length;
                        const int16 = new Int16Array(l);
                        for(let i=0; i<l; i++) int16[i] = inputData[i] * 32768;
                        
                        // Base64 encode
                        const bytes = new Uint8Array(int16.buffer);
                        let binary = '';
                        for(let i=0; i<bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
                        const b64 = btoa(binary);

                        sessionPromise.then(session => {
                            session.sendRealtimeInput({
                                media: {
                                    mimeType: 'audio/pcm;rate=16000',
                                    data: b64
                                }
                            });
                        });
                    };
                    
                    source.connect(processor);
                    processor.connect(inputContextRef.current!.destination);
                },
                onmessage: async (msg: LiveServerMessage) => {
                    const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                    if (audioData && outputContextRef.current) {
                        // Decode
                        const bin = atob(audioData);
                        const bytes = new Uint8Array(bin.length);
                        for(let i=0; i<bin.length; i++) bytes[i] = bin.charCodeAt(i);
                        const int16 = new Int16Array(bytes.buffer);
                        
                        const buffer = outputContextRef.current.createBuffer(1, int16.length, 24000);
                        const channelData = buffer.getChannelData(0);
                        for(let i=0; i<channelData.length; i++) {
                            channelData[i] = int16[i] / 32768.0;
                        }

                        const source = outputContextRef.current.createBufferSource();
                        source.buffer = buffer;
                        source.connect(outputContextRef.current.destination);
                        source.start();
                    }
                },
                onclose: () => {
                    if (!stopRef.current) setStatus('Desconectado');
                },
                onerror: (e) => {
                    console.error(e);
                    setStatus('Error de conexión');
                }
            }
        });
        
        sessionRef.current = sessionPromise;

    } catch (e) {
        console.error("Live API Error", e);
        setStatus('Error al iniciar');
        setActive(false);
    }
  };

  const stopSession = () => {
    stopRef.current = true;
    setActive(false);
    setStatus('Sesión finalizada');
    if (inputContextRef.current) inputContextRef.current.close();
    if (outputContextRef.current) outputContextRef.current.close();
  };

  return (
    <div className="flex flex-col items-center p-8 bg-slate-900 text-white h-[400px]">
        <div className="mb-8 relative">
            <div className={`w-32 h-32 rounded-full border-4 flex items-center justify-center transition-all ${active ? 'border-green-500 shadow-[0_0_30px_#22c55e]' : 'border-slate-700'}`}>
                <div 
                    className="w-full h-full rounded-full bg-green-500 opacity-20 absolute" 
                    style={{ transform: `scale(${1 + volume/20})` }}
                />
                <Mic className={`w-12 h-12 ${active ? 'text-green-500' : 'text-slate-500'}`} />
            </div>
        </div>

        <h3 className="text-xl font-bold mb-2">{status}</h3>
        <p className="text-slate-400 mb-8 text-center max-w-xs">Practica tu pronunciación técnica o haz preguntas sobre el código.</p>

        <button 
            onClick={active ? stopSession : startSession}
            className={`px-8 py-3 rounded-full font-bold text-lg flex items-center ${active ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
        >
            {active ? <><MicOff className="mr-2"/> Terminar</> : <><Mic className="mr-2"/> Hablar</>}
        </button>
    </div>
  );
};