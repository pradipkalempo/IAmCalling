import express from 'express';

const router = express.Router();

function handleRouteErrors(handler) {
    return async (req, res, next) => {
        try {
            await handler(req, res, next);
        } catch (error) {
            console.error('Route error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    };
}

// Admin login route
router.post('/login', handleRouteErrors(async (req, res) => {
    let { password } = req.body;

    console.log('Admin login attempt with password:', password);
    console.log('Admin login attempt password length:', password?.length);
    let adminPassword = process.env.ADMIN_PASSWORD || 'defaultAdminPassword';
    console.log('Admin password from env:', adminPassword);
    console.log('Admin password from env length:', adminPassword.length);

    if (!password) {
        return res.status(400).json({ error: 'Password is required' });
    }

    // Trim both passwords to avoid whitespace issues
    password = password.trim();
    adminPassword = adminPassword.trim();
    
    console.log('After trim - entered:', password);
    console.log('After trim - env:', adminPassword);
    console.log('Passwords match:', password === adminPassword);

    if (password === adminPassword) {
        // Successful login
        console.log('Admin login successful');
        res.json({ message: 'Login successful' });
    } else {
        // Failed login
        console.log('Admin login failed: invalid password');
        res.status(401).json({ error: 'Invalid password' });
    }
}));

// Admin create post route
router.post('/posts', handleRouteErrors(async (req, res) => {
    try {
        const { 
            title, 
            content, 
            plain_text, 
            category, 
            challenge_id, 
            priority, 
            is_official, 
            is_pinned, 
            allow_comments, 
            author_name, 
            author_role,
            published,
            is_draft,
            visibility,
            created_at
        } = req.body;

        console.log('Admin post creation request:', { title, category, published });

        // Validation
        if (!title || !content || !category) {
            return res.status(400).json({ 
                error: 'Title, content, and category are required' 
            });
        }

        if (plain_text && plain_text.length < 10) {
            return res.status(400).json({ 
                error: 'Content must be at least 10 characters long' 
            });
        }

        // Create post object
        const postData = {
            title: title.trim(),
            content: content,
            plain_text: plain_text || '',
            category: category,
            challenge_id: challenge_id || null,
            priority: priority || 'normal',
            is_official: is_official !== undefined ? is_official : true,
            is_pinned: is_pinned || false,
            allow_comments: allow_comments !== undefined ? allow_comments : true,
            author_name: author_name || 'Admin',
            author_role: author_role || 'admin',
            published: published !== undefined ? published : true,
            is_draft: is_draft || false,
            visibility: visibility || 'public',
            created_at: created_at || new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        // If using Supabase, insert into database
        if (req.supabase) {
            try {
                const { data, error } = await req.supabase
                    .from('posts')
                    .insert([postData])
                    .select()
                    .single();

                if (error) {
                    console.error('Supabase insert error:', error);
                    // Fallback to mock data if Supabase fails
                    console.log('Using mock data for post creation');
                    const mockPost = {
                        id: Date.now(),
                        ...postData
                    };
                    return res.status(201).json({
                        message: 'Post created successfully (mock)',
                        post: mockPost
                    });
                }

                console.log('Post created successfully:', data.id);
                return res.status(201).json({
                    message: 'Post created successfully',
                    post: data
                });
            } catch (dbError) {
                console.error('Database error:', dbError);
                // Fallback to mock data
                const mockPost = {
                    id: Date.now(),
                    ...postData
                };
                return res.status(201).json({
                    message: 'Post created successfully (mock)',
                    post: mockPost
                });
            }
        } else {
            // Mock implementation if no database
            const mockPost = {
                id: Date.now(),
                ...postData
            };
            console.log('Post created (mock):', mockPost.id);
            return res.status(201).json({
                message: 'Post created successfully (mock)',
                post: mockPost
            });
        }
    } catch (error) {
        console.error('Error creating admin post:', error);
        return res.status(500).json({ 
            error: 'Failed to create post: ' + error.message 
        });
    }
}));

export default router;