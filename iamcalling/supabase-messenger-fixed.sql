-- CORRECTED VERSION - Works with any column naming
-- 1. Add last_message_at column
ALTER TABLE public.conversations 
ADD COLUMN IF NOT EXISTS last_message_at timestamptz;

-- 2. Create flexible update function
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
DECLARE
    conv_id uuid;
BEGIN
    -- Find conversation ID using common column patterns
    conv_id := COALESCE(NEW.conversation_id, NEW.chat_id, NEW.room_id);
    
    IF conv_id IS NOT NULL THEN
        UPDATE public.conversations 
        SET last_message_at = NOW()
        WHERE id = conv_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Create trigger
DROP TRIGGER IF EXISTS trigger_update_conversation_timestamp ON public.messages;
CREATE TRIGGER trigger_update_conversation_timestamp
    AFTER INSERT ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_timestamp();

-- 4. Sync existing data (run after checking your actual column names)
-- Replace 'conversation_id' with your actual foreign key column name
UPDATE public.conversations 
SET last_message_at = COALESCE(
    (SELECT MAX(created_at) FROM public.messages WHERE conversation_id = conversations.id),
    NOW()
);