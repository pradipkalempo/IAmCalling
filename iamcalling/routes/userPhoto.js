import { createClient } from '@supabase/supabase-js';

export default function userPhotoRoutes(app) {
    // Get user profile photo by email
    app.get('/api/user-photo/:email', async (req, res) => {
        try {
            const { email } = req.params;
            
            const supabase = createClient(
                process.env.SUPABASE_URL,
                process.env.SUPABASE_ANON_KEY
            );
            
            const { data, error } = await supabase
                .from('users')
                .select('profile_photo')
                .eq('email', email)
                .single();
            
            if (error || !data || !data.profile_photo) {
                return res.json({ photo: null });
            }
            
            res.json({ photo: data.profile_photo });
        } catch (error) {
            res.json({ photo: null });
        }
    });
}
