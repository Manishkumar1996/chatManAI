export type Role = 'user' | 'assistant' | 'system';

export type MessageStatus = 'pending' | 'streaming' | 'completed' | 'error';

export interface Message {
  id: string;
  role: Role;
  content: string;
  status?: MessageStatus;
  timestamp: number;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  streamingId: string | null;
  error: string | null;
}

export interface ChatSession {
  id: string;
  title: string;
  date: number; // timestamp
  preview: string; // last message snippet
}
