// Production-ready authentication manager for global deployment
class SupabaseAuthManager {
    constructor() {
        // Prevent multiple instances
        if (window.supabaseAuthManagerInstance) {
            return window.supabaseAuthManagerInstance;
        }
        
        console.log('SupabaseAuthManager: Constructor called at', new Date().toISOString());
        this.supabase = null;
        this.currentUser = null;
        this.initSupabase();
        
        // Store singleton instance
        window.supabaseAuthManagerInstance = this;
    }

    initSupabase() {
        console.log('SupabaseAuthManager: initSupabase() called at', new Date().toISOString());
        const supabaseUrl = window.APP_CONFIG?.supabaseUrl || '';
        const supabaseKey = window.APP_CONFIG?.supabaseAnonKey || '';
        
        if (typeof supabase !== 'undefined') {
            this.supabase = supabase.createClient(supabaseUrl, supabaseKey);
            this.initAuth();
        } else {
            console.log('SupabaseAuthManager: Supabase client not available');
        }
    }

    async initAuth() {
        console.log('SupabaseAuthManager: initAuth() called at', new Date().toISOString());
        try {
            if (!this.supabase) {
                console.log('SupabaseAuthManager: No supabase client available');
                return;
            }
            
            const { data: { session } } = await this.supabase.auth.getSession();
            console.log('SupabaseAuthManager: session =', session);
            if (session?.user) {
                this.currentUser = session.user;
                await this.syncUserData();
            }
        } catch (error) {
            console.error('Auth initialization error:', error);
        }
    }

    async syncUserData() {
        if (!this.currentUser) return;

        try {
            const { data: userData } = await this.supabase
                .from('users')
                .select('*')
                .eq('id', this.currentUser.id)
                .single();

            if (userData) {
                localStorage.setItem('currentUser', JSON.stringify({
                    id: userData.id,
                    email: userData.email,
                    full_name: userData.full_name,
                    profile_photo: userData.profile_photo_filename
                }));
            }
        } catch (error) {
            console.error('User sync error:', error);
        }
    }

    isAuthenticated() {
        // Check for local auth token first (your current system)
        const authToken = localStorage.getItem('auth_token');
        if (authToken) {
            return true;
        }
        
        // Fallback to Supabase auth
        return this.currentUser !== null;
    }

    getCurrentUser() {
        // Check for local auth token first
        const authToken = localStorage.getItem('auth_token');
        if (authToken) {
            const userData = localStorage.getItem('user_data');
            return userData ? JSON.parse(userData) : { authenticated: true };
        }
        
        // Fallback to Supabase
        if (this.currentUser) return this.currentUser;
        
        const stored = localStorage.getItem('currentUser');
        return stored ? JSON.parse(stored) : null;
    }

    async requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = '15-login.html';
            return false;
        }
        return true;
    }

    async logout() {
        try {
            await this.supabase.auth.signOut();
            this.currentUser = null;
            localStorage.clear();
            window.location.href = '15-login.html';
        } catch (error) {
            console.error('Logout error:', error);
        }
    }
}

// Global supabase auth manager instance
if (!window.supabaseAuthManager) {
    console.log('Creating SupabaseAuthManager instance at', new Date().toISOString(), '...');
    window.supabaseAuthManager = new SupabaseAuthManager();
    console.log('SupabaseAuthManager instance created:', window.supabaseAuthManager);
} else {
    console.log('SupabaseAuthManager instance already exists, reusing...');
}
