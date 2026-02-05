-- Drop existing trigger
DROP TRIGGER IF EXISTS trigger_update_conversation_timestamp ON public.messages;

-- Create improved function that handles both sender and receiver
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    -- Update conversation timestamp for both participants
    UPDATE public.conversations 
    SET last_message_at = NOW()
    WHERE (participant1 = NEW.sender_id AND participant2 = NEW.receiver_id)
       OR (participant1 = NEW.receiver_id AND participant2 = NEW.sender_id);
    
    -- If no conversation exists, create one
    IF NOT FOUND THEN
        INSERT INTO public.conversations (participant1, participant2, last_message_at)
        VALUES (NEW.sender_id, NEW.receiver_id, NOW())
        ON CONFLICT DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER trigger_update_conversation_timestamp
    AFTER INSERT ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_timestamp();