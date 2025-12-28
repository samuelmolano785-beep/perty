export type AppState = 'onboarding' | 'map' | 'lesson' | 'tools' | 'certificate';

export interface UserProgress {
  currentLevelId: number;
  xp: number;
  hearts: number;
  streak: number;
  unlockedCertificates: ('basic' | 'expert')[];
}

export interface CourseLevel {
  id: number;
  title: string;
  description: string;
  isLocked: boolean;
  type: 'concept' | 'challenge' | 'checkpoint_basic' | 'checkpoint_expert';
  position: { x: number; y: number }; // For visual mapping
}

export interface LessonContent {
  theory: string;
  question: string;
  options?: string[]; // For multiple choice
  correctAnswer?: string; // For multiple choice validation
  initialCode?: string; // For coding challenge
  expectedOutput?: string; // For coding challenge
  type: 'multiple_choice' | 'coding';
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}
