
-- Add visual_context column to chat_messages table to store images
ALTER TABLE public.chat_messages 
ADD COLUMN IF NOT EXISTS visual_context text;

-- Add index for better performance when querying messages with visual context
CREATE INDEX IF NOT EXISTS idx_chat_messages_visual_context 
ON public.chat_messages(session_id, created_at) 
WHERE visual_context IS NOT NULL;
