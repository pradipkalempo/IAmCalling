-- Enable Supabase Realtime on tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;

-- Ensure RLS is properly configured
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for messages
CREATE POLICY "Users can view their own messages" ON public.messages
FOR SELECT USING (
    auth.uid()::text = sender_id OR auth.uid()::text = receiver_id
);

CREATE POLICY "Users can insert their own messages" ON public.messages
FOR INSERT WITH CHECK (
    auth.uid()::text = sender_id
);

-- Create RLS policies for conversations
CREATE POLICY "Users can view their own conversations" ON public.conversations
FOR SELECT USING (
    auth.uid()::text = participant1 OR auth.uid()::text = participant2
);

CREATE POLICY "Users can update their own conversations" ON public.conversations
FOR UPDATE USING (
    auth.uid()::text = participant1 OR auth.uid()::text = participant2
);