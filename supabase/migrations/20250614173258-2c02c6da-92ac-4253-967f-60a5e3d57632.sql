
-- Create a profiles table for storing additional user information
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Update chat_sessions table to make user_id nullable for anonymous users
ALTER TABLE public.chat_sessions ALTER COLUMN user_id DROP NOT NULL;

-- Update RLS policies for chat_sessions to allow anonymous usage
DROP POLICY IF EXISTS "Users can view their own chat sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Users can create their own chat sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Users can update their own chat sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Users can delete their own chat sessions" ON public.chat_sessions;

-- New policies that work for both authenticated and anonymous users
CREATE POLICY "Users can view their own chat sessions" 
  ON public.chat_sessions 
  FOR SELECT 
  USING (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR 
    (auth.uid() IS NULL AND user_id IS NULL)
  );

CREATE POLICY "Users can create chat sessions" 
  ON public.chat_sessions 
  FOR INSERT 
  WITH CHECK (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR 
    (auth.uid() IS NULL AND user_id IS NULL)
  );

CREATE POLICY "Users can update their own chat sessions" 
  ON public.chat_sessions 
  FOR UPDATE 
  USING (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR 
    (auth.uid() IS NULL AND user_id IS NULL)
  );

CREATE POLICY "Users can delete their own chat sessions" 
  ON public.chat_sessions 
  FOR DELETE 
  USING (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR 
    (auth.uid() IS NULL AND user_id IS NULL)
  );

-- Update chat_messages policies to work with nullable user_id in sessions
DROP POLICY IF EXISTS "Users can view messages from their own chat sessions" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can create messages in their own chat sessions" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can update messages in their own chat sessions" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can delete messages from their own chat sessions" ON public.chat_messages;

CREATE POLICY "Users can view messages from accessible chat sessions" 
  ON public.chat_messages 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_sessions 
      WHERE chat_sessions.id = chat_messages.session_id 
      AND (
        (auth.uid() IS NOT NULL AND chat_sessions.user_id = auth.uid()) OR 
        (auth.uid() IS NULL AND chat_sessions.user_id IS NULL)
      )
    )
  );

CREATE POLICY "Users can create messages in accessible chat sessions" 
  ON public.chat_messages 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chat_sessions 
      WHERE chat_sessions.id = chat_messages.session_id 
      AND (
        (auth.uid() IS NOT NULL AND chat_sessions.user_id = auth.uid()) OR 
        (auth.uid() IS NULL AND chat_sessions.user_id IS NULL)
      )
    )
  );

CREATE POLICY "Users can update messages in accessible chat sessions" 
  ON public.chat_messages 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_sessions 
      WHERE chat_sessions.id = chat_messages.session_id 
      AND (
        (auth.uid() IS NOT NULL AND chat_sessions.user_id = auth.uid()) OR 
        (auth.uid() IS NULL AND chat_sessions.user_id IS NULL)
      )
    )
  );

CREATE POLICY "Users can delete messages from accessible chat sessions" 
  ON public.chat_messages 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_sessions 
      WHERE chat_sessions.id = chat_messages.session_id 
      AND (
        (auth.uid() IS NOT NULL AND chat_sessions.user_id = auth.uid()) OR 
        (auth.uid() IS NULL AND chat_sessions.user_id IS NULL)
      )
    )
  );

-- Create a function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to automatically create a profile when a user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
