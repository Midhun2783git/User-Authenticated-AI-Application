export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

export type EntryCategory = 'personal' | 'work' | 'gratitude' | 'brainstorm' | 'mindfulness' | 'ideas' | 'learning';

export type MoodType = 'calm' | 'energized' | 'reflective' | 'thoughtful' | 'anxious' | 'inspired' | 'focused' | 'grateful';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  modelUsed?: string;
}

export interface JournalEntry {
  id: string;
  userId: string;
  title: string;
  content: string;
  category: EntryCategory;
  mood?: MoodType;
  tags: string[];
  summary?: string;
  insights?: string[];
  actionItems?: string[];
  turns: ChatMessage[];
  starred: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface AnalyzeResponse {
  summary: string;
  insights: string[];
  actionItems: string[];
  suggestedTags?: string[];
  detectedMood?: MoodType;
  modelUsed?: string;
}

export interface ChatResponse {
  text: string;
  modelUsed: string;
}
