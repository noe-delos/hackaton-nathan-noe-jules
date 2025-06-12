export interface Message {
  id: string;
  user_id: string;
  content: string;
  date: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  participants: string[];
  last_message?: Message;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  name: string;
  avatar?: string;
  online?: boolean;
}
