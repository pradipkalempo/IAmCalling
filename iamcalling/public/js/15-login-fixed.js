console.log('🔥 LOGIN SCRIPT LOADED!');
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔥 DOM CONTENT LOADED!');
    const loginForm = document.getElementById('loginForm');
    const notification = document.getElementById('notification');

    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mainMenu = document.getElementById('mainMenu');

    if (mobileMenuBtn && mainMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            mainMenu.classList.toggle('active');
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('🚀 Login form submitted!');

            const email = document.getElementById('email').value.trim();
            const pass1 = document.getElementById('pass1').value;
            const pass2 = document.getElementById('pass2').value;
            const pass3 = document.getElementById('pass3').value;
            const pass4 = document.getElementById('pass4').value;
            const password = pass1 + pass2 + pass3 + pass4;

            // Validation
            if (!email || !isValidEmail(email)) {
                showNotification('❌ Please enter a valid email', true);
                return;
            }

            if (password.length !== 4) {
                showNotification('❌ Please enter all 4 password characters', true);
                return;
            }

            // Proceed with Supabase login
            try {
                console.log('🔍 Attempting Supabase login with:', { email, password: '****' });
                
                // Initialize Supabase with fallback config
                let SUPABASE_URL = window.APP_CONFIG?.supabaseUrl;
                let SUPABASE_ANON_KEY = window.APP_CONFIG?.supabaseAnonKey;
                
                if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
                    // Fallback configuration
                    SUPABASE_URL = 'https://gkckyyyaoqsaouemjnxl.supabase.co';
                    SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrY2t5eXlhb3FzYW91ZW1qbnhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyMzA3OTEsImV4cCI6MjA3MjgwNjc5MX0.0z5c-3P1fMSW2qiWg7IT3Oqv-65B3lZ8Lsq2aDvMYQk';
                }
                
                if (typeof window.supabase === 'undefined') {
                    throw new Error('Supabase library not loaded');
                }
                
                const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
                
                // Query user from Supabase
                const { data: user, error } = await supabaseClient
                    .from('users')
                    .select('*')
                    .eq('email', email)
                    .eq('password', password)
                    .single();
                
                console.log('📦 Supabase response:', { user, error });
                
                if (error || !user) {
                    console.log('❌ Login failed - invalid credentials');
                    showNotification('❌ Invalid email or password', true);
                    return;
                }
                
                console.log('🖼️ Profile photo from Supabase:', user.profile_photo ? 'EXISTS (length: ' + user.profile_photo.length + ')' : 'NULL/EMPTY');
                
                // Login successful - use global auth manager
                if (window.globalAuth) {
                    const userData = {
                        id: user.id,
                        email: user.email,
                        name: user.first_name + ' ' + (user.last_name || ''),
                        first_name: user.first_name,
                        last_name: user.last_name,
                        full_name: user.first_name + ' ' + (user.last_name || ''),
                        profile_photo: user.profile_photo,
                        profilePhoto: user.profile_photo,
                        photo: user.profile_photo
                    };
                    console.log('💾 Saving user data to globalAuth:', { ...userData, profile_photo: userData.profile_photo ? 'EXISTS' : 'NULL' });
                    window.globalAuth.setUser(userData);
                }
                
                // Show success notification (GREEN)
                showNotification('✅ Login successful! Redirecting...', false);
                console.log('🚀 Login successful, redirecting...');
                
                // Immediate redirect like Instagram
                setTimeout(() => {
                    window.location.href = '18-profile.html';
                }, 1000);
                
            } catch (error) {
                console.error('❌ Login error:', error);
                showNotification('❌ Login failed. Please try again.', true);
            }
        });
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function showNotification(message, isError = false) {
        console.log('📢 Showing notification:', message, 'isError:', isError);
        if (notification) {
            notification.textContent = message;
            notification.classList.remove('error', 'show');
            
            if (isError) {
                notification.classList.add('error');
                console.log('🔴 Error notification (red)');
            } else {
                console.log('🟢 Success notification (green)');
            }
            
            notification.classList.add('show');
            notification.scrollIntoView({ behavior: 'smooth', block: 'center' });

            setTimeout(() => {
                notification.classList.remove('show');
            }, 3000);
        }
    }

    // Password box auto-advance functionality
    const passwordBoxes = document.querySelectorAll('.password-box');
    passwordBoxes.forEach((box, index) => {
        box.addEventListener('input', function(e) {
            if (e.target.value.length === 1 && index < passwordBoxes.length - 1) {
                passwordBoxes[index + 1].focus();
            }
        });
        
        box.addEventListener('keydown', function(e) {
            if (e.key === 'Backspace' && e.target.value === '' && index > 0) {
                passwordBoxes[index - 1].focus();
            }
        });
    });

    // Auto-focus on first password box
    if (passwordBoxes.length > 0) {
        passwordBoxes[0].focus();
    }
});