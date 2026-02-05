import express from 'express';
import { createClient } from '@supabase/supabase-js';
const router = express.Router();

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware to verify user authentication
const authenticateUser = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'No authorization header' });
        }

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error } = await supabase.auth.getUser(token);
        
        if (error || !user) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(401).json({ error: 'Authentication failed' });
    }
};

// Get all conversations for a user
router.get('/conversations', authenticateUser, async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Get conversations with participant details and last message
        const { data: conversations, error } = await supabase
            .from('conversations')
            .select(`
                id,
                participant1,
                participant2,
                created_at,
                updated_at,
                participant1_user:users!conversations_participant1_fkey(id, full_name, email, profile_photo, last_seen),
                participant2_user:users!conversations_participant2_fkey(id, full_name, email, profile_photo, last_seen)
            `)
            .or(`participant1.eq.${userId},participant2.eq.${userId}`)
            .order('updated_at', { ascending: false });

        if (error) throw error;

        // Get last message for each conversation
        const conversationsWithMessages = await Promise.all(
            conversations.map(async (conv) => {
                const { data: lastMessage } = await supabase
                    .from('messages')
                    .select('id, content, sender_id, created_at, read')
                    .eq('conversation_id', conv.id)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single();

                // Get unread count
                const { count: unreadCount } = await supabase
                    .from('messages')
                    .select('id', { count: 'exact' })
                    .eq('conversation_id', conv.id)
                    .eq('receiver_id', userId)
                    .eq('read', false);

                // Determine other participant
                const otherParticipant = conv.participant1 === userId ? 
                    conv.participant2_user : conv.participant1_user;

                return {
                    id: conv.id,
                    otherParticipant,
                    lastMessage,
                    unreadCount: unreadCount || 0,
                    updatedAt: conv.updated_at
                };
            })
        );

        res.json(conversationsWithMessages);
    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ error: 'Failed to fetch conversations' });
    }
});

// Get messages for a conversation
router.get('/conversations/:conversationId/messages', authenticateUser, async (req, res) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user.id;
        const { page = 1, limit = 50 } = req.query;
        
        // Verify user is part of this conversation
        const { data: conversation } = await supabase
            .from('conversations')
            .select('participant1, participant2')
            .eq('id', conversationId)
            .single();

        if (!conversation || (conversation.participant1 !== userId && conversation.participant2 !== userId)) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Get messages with pagination
        const { data: messages, error } = await supabase
            .from('messages')
            .select(`
                id,
                content,
                sender_id,
                receiver_id,
                message_type,
                read,
                created_at,
                sender:users!messages_sender_id_fkey(id, full_name, email, profile_photo)
            `)
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: false })
            .range((page - 1) * limit, page * limit - 1);

        if (error) throw error;

        res.json(messages.reverse()); // Reverse to get chronological order
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// Send a message
router.post('/conversations/:conversationId/messages', authenticateUser, async (req, res) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user.id;
        const { content, messageType = 'text' } = req.body;

        if (!content || content.trim().length === 0) {
            return res.status(400).json({ error: 'Message content is required' });
        }

        // Verify user is part of this conversation
        const { data: conversation } = await supabase
            .from('conversations')
            .select('participant1, participant2')
            .eq('id', conversationId)
            .single();

        if (!conversation || (conversation.participant1 !== userId && conversation.participant2 !== userId)) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Determine receiver
        const receiverId = conversation.participant1 === userId ? 
            conversation.participant2 : conversation.participant1;

        // Insert message
        const { data: message, error } = await supabase
            .from('messages')
            .insert({
                conversation_id: conversationId,
                sender_id: userId,
                receiver_id: receiverId,
                content: content.trim(),
                message_type: messageType
            })
            .select(`
                id,
                content,
                sender_id,
                receiver_id,
                message_type,
                read,
                created_at,
                sender:users!messages_sender_id_fkey(id, full_name, email, profile_photo)
            `)
            .single();

        if (error) throw error;

        // Update conversation timestamp
        await supabase
            .from('conversations')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', conversationId);

        res.status(201).json(message);
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

// Create or get conversation with another user
router.post('/conversations', authenticateUser, async (req, res) => {
    try {
        const userId = req.user.id;
        const { otherUserId } = req.body;

        if (!otherUserId) {
            return res.status(400).json({ error: 'Other user ID is required' });
        }

        if (otherUserId === userId) {
            return res.status(400).json({ error: 'Cannot create conversation with yourself' });
        }

        // Check if conversation already exists
        const { data: existingConversation } = await supabase
            .from('conversations')
            .select('id')
            .or(`and(participant1.eq.${userId},participant2.eq.${otherUserId}),and(participant1.eq.${otherUserId},participant2.eq.${userId})`)
            .single();

        if (existingConversation) {
            return res.json({ conversationId: existingConversation.id });
        }

        // Create new conversation
        const { data: newConversation, error } = await supabase
            .from('conversations')
            .insert({
                participant1: userId,
                participant2: otherUserId
            })
            .select('id')
            .single();

        if (error) throw error;

        res.status(201).json({ conversationId: newConversation.id });
    } catch (error) {
        console.error('Error creating conversation:', error);
        res.status(500).json({ error: 'Failed to create conversation' });
    }
});

// Mark messages as read
router.put('/conversations/:conversationId/messages/read', authenticateUser, async (req, res) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user.id;

        // Mark all unread messages in this conversation as read
        const { error } = await supabase
            .from('messages')
            .update({ read: true })
            .eq('conversation_id', conversationId)
            .eq('receiver_id', userId)
            .eq('read', false);

        if (error) throw error;

        res.json({ success: true });
    } catch (error) {
        console.error('Error marking messages as read:', error);
        res.status(500).json({ error: 'Failed to mark messages as read' });
    }
});

// Get all users for starting new conversations
router.get('/users', authenticateUser, async (req, res) => {
    try {
        const userId = req.user.id;
        const { search = '', limit = 50 } = req.query;

        let query = supabase
            .from('users')
            .select('id, full_name, first_name, last_name, email, profile_photo, last_seen')
            .neq('id', userId)
            .order('last_seen', { ascending: false })
            .limit(limit);

        if (search) {
            query = query.or(`full_name.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`);
        }

        const { data: users, error } = await query;

        if (error) throw error;

        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Initiate a call
router.post('/calls', authenticateUser, async (req, res) => {
    try {
        const userId = req.user.id;
        const { receiverId, callType } = req.body;

        if (!receiverId || !callType) {
            return res.status(400).json({ error: 'Receiver ID and call type are required' });
        }

        if (!['audio', 'video'].includes(callType)) {
            return res.status(400).json({ error: 'Invalid call type' });
        }

        // Create call record
        const { data: call, error } = await supabase
            .from('calls')
            .insert({
                caller_id: userId,
                receiver_id: receiverId,
                call_type: callType,
                status: 'initiated'
            })
            .select(`
                id,
                caller_id,
                receiver_id,
                call_type,
                status,
                created_at,
                caller:users!calls_caller_id_fkey(id, full_name, email, profile_photo),
                receiver:users!calls_receiver_id_fkey(id, full_name, email, profile_photo)
            `)
            .single();

        if (error) throw error;

        res.status(201).json(call);
    } catch (error) {
        console.error('Error initiating call:', error);
        res.status(500).json({ error: 'Failed to initiate call' });
    }
});

// Update call status
router.put('/calls/:callId', authenticateUser, async (req, res) => {
    try {
        const { callId } = req.params;
        const userId = req.user.id;
        const { status, duration } = req.body;

        if (!status) {
            return res.status(400).json({ error: 'Status is required' });
        }

        if (!['accepted', 'rejected', 'ended'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        // Verify user is part of this call
        const { data: call } = await supabase
            .from('calls')
            .select('caller_id, receiver_id')
            .eq('id', callId)
            .single();

        if (!call || (call.caller_id !== userId && call.receiver_id !== userId)) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Update call
        const updateData = { status };
        if (status === 'ended' && duration) {
            updateData.duration = duration;
            updateData.ended_at = new Date().toISOString();
        }

        const { data: updatedCall, error } = await supabase
            .from('calls')
            .update(updateData)
            .eq('id', callId)
            .select()
            .single();

        if (error) throw error;

        res.json(updatedCall);
    } catch (error) {
        console.error('Error updating call:', error);
        res.status(500).json({ error: 'Failed to update call' });
    }
});

// Get call history
router.get('/calls', authenticateUser, async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 20 } = req.query;

        const { data: calls, error } = await supabase
            .from('calls')
            .select(`
                id,
                caller_id,
                receiver_id,
                call_type,
                status,
                duration,
                created_at,
                ended_at,
                caller:users!calls_caller_id_fkey(id, full_name, email, profile_photo),
                receiver:users!calls_receiver_id_fkey(id, full_name, email, profile_photo)
            `)
            .or(`caller_id.eq.${userId},receiver_id.eq.${userId}`)
            .order('created_at', { ascending: false })
            .range((page - 1) * limit, page * limit - 1);

        if (error) throw error;

        res.json(calls);
    } catch (error) {
        console.error('Error fetching call history:', error);
        res.status(500).json({ error: 'Failed to fetch call history' });
    }
});

// Update user's last seen timestamp
router.put('/users/last-seen', authenticateUser, async (req, res) => {
    try {
        const userId = req.user.id;

        const { error } = await supabase
            .from('users')
            .update({ last_seen: new Date().toISOString() })
            .eq('id', userId);

        if (error) throw error;

        res.json({ success: true });
    } catch (error) {
        console.error('Error updating last seen:', error);
        res.status(500).json({ error: 'Failed to update last seen' });
    }
});

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        service: 'messenger-api'
    });
});

export default router;
