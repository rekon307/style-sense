
-- Create a table for video conversations
CREATE TABLE public.video_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id TEXT NOT NULL UNIQUE,
  conversation_name TEXT,
  conversation_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  callback_url TEXT,
  user_id UUID REFERENCES auth.users,
  session_id UUID REFERENCES public.chat_sessions(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.video_conversations ENABLE ROW LEVEL SECURITY;

-- Create policies for video conversations
CREATE POLICY "Users can view their own video conversations" 
  ON public.video_conversations 
  FOR SELECT 
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can create video conversations" 
  ON public.video_conversations 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own video conversations" 
  ON public.video_conversations 
  FOR UPDATE 
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Create index for better performance
CREATE INDEX idx_video_conversations_user_id ON public.video_conversations(user_id);
CREATE INDEX idx_video_conversations_session_id ON public.video_conversations(session_id);
CREATE INDEX idx_video_conversations_status ON public.video_conversations(status);
