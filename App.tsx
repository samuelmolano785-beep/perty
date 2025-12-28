import React, { useState, useEffect } from 'react';
import { Onboarding } from './components/Onboarding';
import { WorldMap } from './components/WorldMap';
import { Sidebar } from './components/Sidebar';
import { ToolsDashboard } from './components/ToolsDashboard';
import { CertificateView } from './components/CertificateView';
import { LessonOverlay } from './components/LessonOverlay';
import { UserProgress, CourseLevel, AppState } from './types';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('onboarding');
  const [userLanguage, setUserLanguage] = useState<string | null>(null);
  const [progress, setProgress] = useState<UserProgress>({
    currentLevelId: 1,
    xp: 0,
    hearts: 5,
    streak: 1,
    unlockedCertificates: []
  });
  const [activeLevel, setActiveLevel] = useState<CourseLevel | null>(null);
  const [apiKeyReady, setApiKeyReady] = useState(false);

  // Initialize API Key
  useEffect(() => {
    const initKey = async () => {
      // Cast window to any to access aistudio which might be injected by the environment
      const win = window as any;
      if (win.aistudio) {
        const hasKey = await win.aistudio.hasSelectedApiKey();
        if (!hasKey) {
          await win.aistudio.openSelectKey();
        }
        setApiKeyReady(true);
      } else {
        // Fallback for dev environments without the wrapper
        setApiKeyReady(true);
      }
    };
    initKey();
  }, []);

  const handleLanguageSelect = (lang: string) => {
    setUserLanguage(lang);
    setAppState('map');
  };

  const handleLevelSelect = (level: CourseLevel) => {
    setActiveLevel(level);
    setAppState('lesson');
  };

  const handleLessonComplete = (xpGained: number, passed: boolean) => {
    if (passed) {
      setProgress(prev => ({
        ...prev,
        xp: prev.xp + xpGained,
        currentLevelId: Math.max(prev.currentLevelId, (activeLevel?.id || 0) + 1)
      }));
    } else {
      setProgress(prev => ({
        ...prev,
        hearts: Math.max(0, prev.hearts - 1)
      }));
    }
    setAppState('map');
    setActiveLevel(null);
  };

  const handleOpenTools = () => setAppState('tools');
  const handleOpenCertificate = () => setAppState('certificate');
  const handleBackToMap = () => setAppState('map');

  if (!apiKeyReady) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900 text-white">
        <Loader2 className="w-10 h-10 animate-spin text-green-500" />
        <span className="ml-4 font-bold text-xl">Conectando con Google AI...</span>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full bg-slate-100 overflow-hidden relative">
      {appState === 'onboarding' && (
        <Onboarding onSelectLanguage={handleLanguageSelect} />
      )}

      {appState !== 'onboarding' && (
        <>
          <Sidebar 
            progress={progress} 
            activeTab={appState}
            onNavigate={(view) => setAppState(view as AppState)}
            userLanguage={userLanguage || 'Python'}
          />
          
          <main className="flex-1 h-full relative overflow-y-auto overflow-x-hidden">
            {appState === 'map' && (
              <WorldMap 
                currentLevelId={progress.currentLevelId} 
                language={userLanguage || 'Python'}
                onLevelSelect={handleLevelSelect}
              />
            )}
            
            {appState === 'lesson' && activeLevel && (
              <LessonOverlay 
                level={activeLevel} 
                language={userLanguage || 'Python'}
                onComplete={handleLessonComplete}
                onExit={handleBackToMap}
              />
            )}

            {appState === 'tools' && (
              <ToolsDashboard language={userLanguage || 'Python'} />
            )}

            {appState === 'certificate' && (
              <CertificateView 
                progress={progress} 
                language={userLanguage || 'Python'} 
              />
            )}
          </main>
        </>
      )}
    </div>
  );
};

export default App;