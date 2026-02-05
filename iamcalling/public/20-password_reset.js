// Password Reset Functionality
document.addEventListener('DOMContentLoaded', function() {
    const resetForm = document.getElementById('resetForm');
    const notification = document.getElementById('notification');
    
    // Check if required elements exist
    if (!resetForm) {
        console.error('Reset form not found');
        return;
    }
    
    if (!notification) {
        console.error('Notification element not found');
        return;
    }
    
    // Initialize Supabase
    const SUPABASE_URL = window.APP_CONFIG?.supabaseUrl || '';
    const SUPABASE_ANON_KEY = window.APP_CONFIG?.supabaseAnonKey || '';
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Show notification
    function showNotification(message, isError = false) {
        notification.textContent = message;
        notification.className = `notification ${isError ? 'error' : ''} show`;
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    // Handle form submission
    resetForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        
        if (!email) {
            showNotification('Please enter your email address', true);
            return;
        }

        try {
            // Check if user exists in database
            const { data: users, error: userError } = await supabase
                .from('users')
                .select('id, email, full_name')
                .eq('email', email);
            
            const user = users && users.length > 0 ? users[0] : null;

            if (userError) {
                console.error('Database error:', userError);
                showNotification('Database error. Please try again.', true);
                return;
            }
            
            if (!user) {
                showNotification('No account found with this email address', true);
                return;
            }

            // Generate reset token
            const resetToken = generateResetToken();
            const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now

            // Store reset token in database
            const { error: tokenError } = await supabase
                .from('password_resets')
                .insert({
                    user_id: user.id,
                    email: email,
                    reset_token: resetToken,
                    expires_at: expiresAt.toISOString(),
                    created_at: new Date().toISOString()
                });

            if (tokenError) {
                console.error('Token storage error:', tokenError);
                showNotification('Failed to generate reset link. Please try again.', true);
                return;
            }

            // Generate reset link and show to user
            const resetLink = `${window.location.origin}/reset-password.html?token=${resetToken}`;
            
            // Show reset link directly to user
            showResetLink(resetLink);
            resetForm.reset();

        } catch (error) {
            console.error('Reset error:', error);
            showNotification('An error occurred. Please try again.', true);
        }
    });

    // Generate random reset token
    function generateResetToken() {
        return Math.random().toString(36).substring(2, 15) + 
               Math.random().toString(36).substring(2, 15) +
               Date.now().toString(36);
    }

    // Show reset link directly to user
    function showResetLink(resetLink) {
        const linkContainer = document.createElement('div');
        linkContainer.style.cssText = 'margin-top: 20px; padding: 15px; background: #f0f8ff; border: 1px solid #007bff; border-radius: 5px;';
        linkContainer.innerHTML = `
            <h3 style="color: #007bff; margin: 0 0 10px 0;">Password Reset Link Generated</h3>
            <p style="margin: 0 0 10px 0;">Click the link below to reset your password:</p>
            <a href="${resetLink}" style="color: #007bff; word-break: break-all;">${resetLink}</a>
            <p style="margin: 10px 0 0 0; font-size: 12px; color: #666;">This link expires in 1 hour.</p>
        `;
        
        // Insert after the form
        resetForm.parentNode.insertBefore(linkContainer, resetForm.nextSibling);
        
        showNotification('Password reset link generated successfully!');
    }

    // Mobile menu functionality
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mainMenu = document.getElementById('mainMenu');

    if (mobileMenuBtn && mainMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            mainMenu.classList.toggle('active');
        });
    }
});