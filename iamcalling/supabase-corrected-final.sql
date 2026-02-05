-- Drop existing trigger first
DROP TRIGGER IF EXISTS trigger_update_conversation_timestamp ON public.messages;

-- Add column if not exists
ALTER TABLE public.conversations 
ADD COLUMN IF NOT EXISTS last_message_at timestamptz;

-- Create/replace function with correct column names
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.conversations 
    SET last_message_at = NOW()
    WHERE (participant1 = NEW.sender_id AND participant2 = NEW.receiver_id)
       OR (participant1 = NEW.receiver_id AND participant2 = NEW.sender_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER trigger_update_conversation_timestamp
    AFTER INSERT ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_timestamp();

-- Sync existing data with correct column names
UPDATE public.conversations 
SET last_message_at = (
    SELECT MAX(created_at) 
    FROM public.messages 
    WHERE (messages.sender_id = conversations.participant1 AND messages.receiver_id = conversations.participant2)
       OR (messages.sender_id = conversations.participant2 AND messages.receiver_id = conversations.participant1)
);