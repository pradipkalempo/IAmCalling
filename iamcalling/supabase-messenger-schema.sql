-- 1. Add last_message_at column to conversations table
ALTER TABLE public.conversations 
ADD COLUMN last_message_at timestamptz;

-- 2. Create function to update conversation timestamp
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    -- Update using common foreign key patterns
    UPDATE public.conversations 
    SET last_message_at = NOW()
    WHERE id = COALESCE(NEW.conversation_id, NEW.chat_id, NEW.room_id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Create trigger on messages table
CREATE TRIGGER trigger_update_conversation_timestamp
    AFTER INSERT ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_timestamp();

-- 4. Sync existing data - set last_message_at to latest message timestamp
-- First check what foreign key column exists in messages table
UPDATE public.conversations 
SET last_message_at = (
    SELECT MAX(created_at) 
    FROM public.messages 
    WHERE COALESCE(messages.conversation_id, messages.chat_id, messages.room_id) = conversations.id
);