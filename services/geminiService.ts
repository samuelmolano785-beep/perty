import { GoogleGenAI, Type, Modality } from "@google/genai";
import { LessonContent, CourseLevel } from "../types";

// Helper to get client with current key
const getClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

// --- Helpers ---

function base64ToUint8Array(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function createWavBlob(pcmData: Uint8Array, sampleRate: number = 24000): Blob {
  const numChannels = 1;
  const byteRate = sampleRate * numChannels * 2; // 16-bit
  const blockAlign = numChannels * 2;
  const wavHeader = new ArrayBuffer(44);
  const view = new DataView(wavHeader);

  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  // RIFF
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + pcmData.length, true);
  writeString(view, 8, 'WAVE');
  
  // fmt
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size
  view.setUint16(20, 1, true); // AudioFormat (PCM)
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true); // BitsPerSample

  // data
  writeString(view, 36, 'data');
  view.setUint32(40, pcmData.length, true);

  return new Blob([view, pcmData], { type: 'audio/wav' });
}

// --- Content Generation ---

export const generateSyllabus = async (language: string): Promise<CourseLevel[]> => {
  // Static syllabus structure for instant loading.
  const syllabusStructure = [
    { title: "Estructura Básica", description: "Esqueleto del código", type: 'concept' },
    { title: "Etiquetas de Texto", description: "Párrafos y Títulos", type: 'concept' },
    { title: "Listas y Elementos", description: "Organizando datos", type: 'challenge' },
    { title: "Enlaces e Imágenes", description: "Conectando recursos", type: 'concept' },
    { title: "Contenedores Div", description: "Agrupando elementos", type: 'concept' },
    { title: "Desafío de Estructura", description: "Prueba de maquetación", type: 'challenge' },
    { title: "Estilos Básicos", description: "Introducción a CSS", type: 'concept' },
    { title: "Colores y Fondos", description: "Dando vida visual", type: 'concept' },
    { title: "Checkpoint: Novato", description: "Examen Nivel Básico", type: 'checkpoint_basic' }, 
    { title: "Formularios", description: "Inputs y Botones", type: 'concept' },
    { title: "Tablas de Datos", description: "Filas y Columnas", type: 'concept' },
    { title: "Desafío de Interacción", description: "Creando una interfaz", type: 'challenge' },
    { title: "Variables (JS/Py)", description: "Guardando valores", type: 'concept' },
    { title: "Funciones Simples", description: "Reutilizando lógica", type: 'concept' },
    { title: "Condicionales", description: "Tomando decisiones", type: 'concept' },
    { title: "Bucles", description: "Repitiendo tareas", type: 'concept' },
    { title: "Arrays / Listas", description: "Colecciones", type: 'concept' },
    { title: "Eventos", description: "Clics y Teclas", type: 'concept' },
    { title: "Proyecto Final", description: "Aplicación completa", type: 'challenge' },
    { title: "Checkpoint: Experto", description: "Examen Final", type: 'checkpoint_expert' }
  ];

  return syllabusStructure.map((item, index) => ({
    id: index + 1,
    title: item.title,
    description: item.description,
    type: item.type as any,
    isLocked: index > 0,
    position: { x: 50 + Math.sin(index) * 30, y: index * 120 + 50 } 
  }));
};

export const generateLesson = async (language: string, level: CourseLevel): Promise<LessonContent> => {
  const ai = getClient();
  const isCoding = level.type === 'challenge' || level.type.includes('checkpoint') || level.type === 'concept';
  
  // Prompt diseñado para emular el estilo de la captura de pantalla: Explicaciones ricas, ejemplos visuales y contexto de código claro.
  const prompt = `Actúa como un diseñador de cursos estilo Duolingo/Codecademy. 
  Genera una lección de ${language} sobre "${level.title}".
  
  OBJETIVO: Que el usuario entienda CONCEPTUALMENTE y luego practique.

  FORMATO DE RESPUESTA JSON REQUERIDO:
  1. theory: Explicación detallada pero amigable (Español). 
     - REGLA: Usa etiquetas HTML para formato.
     - Usa <code class="bg-gray-800 text-yellow-300 px-1 rounded">codigo</code> para resaltar palabras clave inline.
     - Incluye SIEMPRE un bloque de ejemplo de código dentro de la teoría envuelto en <pre class="bg-gray-900 text-gray-100 p-3 rounded-md text-sm my-2 border-l-4 border-green-500"><code>...</code></pre>.
     - Explica qué hace cada parte del ejemplo.
     - Divide el texto en párrafos cortos <p class="mb-2">...</p>.

  2. question: Una instrucción corta y directa para el ejercicio práctico. (Ej: "Añade una etiqueta H1 dentro del body").

  3. initialCode: El código base que aparecerá en el editor.
     - IMPORTANTE: No des el editor vacío. Da el "esqueleto" (boilerplate).
     - Si es HTML, pon <!DOCTYPE html><html><body> ... </body></html>.
     - Deja un comentario claro donde el usuario debe escribir: <!-- ESCRIBE TU CÓDIGO AQUÍ --> o # ESCRIBE AQUÍ.
  
  4. type: "${isCoding ? 'coding' : 'multiple_choice'}"
  5. options: (Array strings) Solo si es multiple_choice.
  6. correctAnswer: (String) Solo si es multiple_choice.
  
  Nivel: Principiante Absoluto. Tono: Motivador.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          theory: { type: Type.STRING },
          question: { type: Type.STRING },
          type: { type: Type.STRING, enum: ['multiple_choice', 'coding'] },
          options: { type: Type.ARRAY, items: { type: Type.STRING } },
          correctAnswer: { type: Type.STRING },
          initialCode: { type: Type.STRING }
        }
      }
    }
  });

  return JSON.parse(response.text || '{}');
};

export const checkCodeAnswer = async (language: string, question: string, code: string): Promise<{ passed: boolean; feedback: string; output: string; errorLine?: number }> => {
  const ai = getClient();
  const prompt = `Eres un validador de código estricto pero amable.
  Lenguaje: ${language}.
  Misión del alumno: "${question}". 
  Código entregado: \`${code}\`.
  
  Analiza si el código CUMPLE la misión.
  
  JSON de Salida:
  { 
    "passed": boolean (true si funciona y cumple la misión), 
    "feedback": string (Si falla, di por qué en Español simple. Si pasa, di algo positivo y breve), 
    "output": string (Simula la salida de consola o renderizado texto),
    "errorLine": number (Linea aproximada del error, o 0)
  }`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview', 
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          passed: { type: Type.BOOLEAN },
          feedback: { type: Type.STRING },
          output: { type: Type.STRING },
          errorLine: { type: Type.INTEGER }
        }
      }
    }
  });

  return JSON.parse(response.text || '{"passed": false, "feedback": "Error analyzing", "output": "Error"}');
};

export const getAiHint = async (language: string, question: string, currentCode: string): Promise<string> => {
  const ai = getClient();
  const prompt = `El estudiante está atascado en ${language}.
  Misión: "${question}"
  Código actual: "${currentCode}"
  
  Dame una pista MUY SENCILLA, casi obvia, en español coloquial. Sin palabras raras.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
  });
  
  return response.text;
};

// --- Media Generation ---

export const generateCertificate = async (userName: string, level: 'Basic' | 'Expert', language: string): Promise<string> => {
  const ai = getClient();
  const prompt = `A prestigious, golden certificate of completion for ${userName} who reached ${level} level in ${language}. High detail, professional design, 4k resolution.`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: prompt,
    config: {
      imageConfig: {
        imageSize: '1K',
        aspectRatio: '4:3'
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return '';
};

export const generateConceptVideo = async (topic: string, language: string) => {
  const ai = getClient();
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: `A futuristic, high-tech abstract visualization explaining the concept of ${topic} in computer programming. 3D animation, glowing neon, digital world.`,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: '16:9'
    }
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const uri = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (uri) {
    const res = await fetch(`${uri}&key=${process.env.API_KEY}`);
    if (!res.ok) return null;
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  }
  return null;
};

// --- Grounding Tools ---

export const searchTechNews = async (query: string) => {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Find recent news or tutorials about: ${query}`,
    config: {
      tools: [{ googleSearch: {} }]
    }
  });
  
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  return {
    text: response.text,
    links: chunks.map((c: any) => c.web?.uri).filter(Boolean)
  };
};

export const findTechEvents = async (location: { lat: number, lng: number }) => {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: "Find tech meetups, hackathons, or computer stores near me.",
    config: {
      tools: [{ googleMaps: {} }],
      toolConfig: {
        retrievalConfig: {
          latLng: {
            latitude: location.lat,
            longitude: location.lng
          }
        }
      }
    }
  });
  return response.text;
};

// --- Audio ---

export const transcribeAudio = async (audioBase64: string) => {
    const ai = getClient();
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
            parts: [
                { inlineData: { mimeType: 'audio/wav', data: audioBase64 } },
                { text: "Transcribe this audio exactly." }
            ]
        }
    });
    return response.text;
}

export const textToSpeech = async (text: string) => {
    // Strip HTML tags for clean speech
    const cleanText = text.replace(/<[^>]*>/g, '');
    
    const ai = getClient();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-tts',
        contents: { parts: [{ text: cleanText }] },
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
            }
        }
    });
    
    const base64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if(base64) {
        const pcmData = base64ToUint8Array(base64);
        const wavBlob = createWavBlob(pcmData, 24000);
        return URL.createObjectURL(wavBlob);
    }
    return null;
}