
export interface Message {
  role: 'user' | 'assistant';
  content: string;
  visual_context?: string | null;
  created_at?: string;
  id?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  user_id?: string | null;
}

export interface VisualHistoryMessage {
  role: string;
  content: string;
  visual_context: string | null;
  created_at: string;
}
