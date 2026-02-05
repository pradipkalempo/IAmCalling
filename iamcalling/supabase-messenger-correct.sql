-- 1. Add last_message_at column to conversations table
ALTER TABLE public.conversations 
ADD COLUMN IF NOT EXISTS last_message_at timestamptz;

-- 2. Create function to update conversation timestamp
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    -- Update conversation where either participant matches sender or receiver
    UPDATE public.conversations 
    SET last_message_at = NOW()
    WHERE (participant1_id = NEW.sender_id AND participant2_id = NEW.receiver_id)
       OR (participant1_id = NEW.receiver_id AND participant2_id = NEW.sender_id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Create trigger on messages table
DROP TRIGGER IF EXISTS trigger_update_conversation_timestamp ON public.messages;
CREATE TRIGGER trigger_update_conversation_timestamp
    AFTER INSERT ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_timestamp();

-- 4. Sync existing data - set last_message_at to latest message timestamp
UPDATE public.conversations 
SET last_message_at = (
    SELECT MAX(created_at) 
    FROM public.messages 
    WHERE (messages.sender_id = conversations.participant1_id AND messages.receiver_id = conversations.participant2_id)
       OR (messages.sender_id = conversations.participant2_id AND messages.receiver_id = conversations.participant1_id)
);