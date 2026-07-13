// Simple Password Reset with Email - Using Web3Forms (Free)

document.getElementById('resetForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const submitBtn = e.target.querySelector('.reset-btn');
    const notification = document.getElementById('notification');
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Checking account...';
    
    try {
        // Check if user exists in Supabase
        const supabaseUrl = 'https://gkckyyyaoqsaouemjnxl.supabase.co';
        const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrY2t5eXlhb3FzYW91ZW1qbnhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyMzA3OTEsImV4cCI6MjA3MjgwNjc5MX0.0z5c-3P1fMSW2qiWg7IT3Oqv-65B3lZ8Lsq2aDvMYQk';
        
        const checkResponse = await fetch(`${supabaseUrl}/rest/v1/users?select=id,email,first_name&email=eq.${encodeURIComponent(email)}`, {
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`
            }
        });
        
        const users = await checkResponse.json();
        
        if (!users || users.length === 0) {
            notification.textContent = 'No account found with this email address';
            notification.classList.add('error');
            notification.classList.add('show');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send Reset Link';
            setTimeout(() => notification.classList.remove('show'), 5000);
            return;
        }
        
        // Generate reset token
        submitBtn.textContent = 'Generating reset link...';
        
        const resetToken = Array.from(crypto.getRandomValues(new Uint8Array(32)))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
        
        const resetExpiry = new Date(Date.now() + 3600000).toISOString();
        
        // Save token to Supabase
        const updateResponse = await fetch(`${supabaseUrl}/rest/v1/users?id=eq.${users[0].id}`, {
            method: 'PATCH',
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
                reset_token: resetToken,
                reset_token_expiry: resetExpiry
            })
        });
        
        if (!updateResponse.ok) {
            throw new Error('Failed to generate reset token');
        }
        
        // Send email using Web3Forms (free, no signup)
        submitBtn.textContent = 'Sending email...';
        
        const resetLink = `${window.location.origin}/reset-password.html?token=${resetToken}`;
        
        const emailData = {
            access_key: 'YOUR_WEB3FORMS_KEY', // Get free key from https://web3forms.com
            subject: 'Password Reset Request - IAMCALLING',
            from_name: 'IAMCALLING',
            email: email,
            message: `Hi ${users[0].first_name || 'there'},\n\nClick this link to reset your password:\n${resetLink}\n\nThis link expires in 1 hour.\n\nIf you didn't request this, ignore this email.\n\n- IAMCALLING Team`
        };
        
        const emailResponse = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(emailData)
        });
        
        const emailResult = await emailResponse.json();
        
        if (emailResult.success) {
            notification.textContent = '✓ Password reset link sent to your email!';
            notification.classList.remove('error');
            notification.classList.add('show');
            submitBtn.textContent = '✓ Email Sent!';
            document.getElementById('email').value = '';
            
            setTimeout(() => {
                window.location.href = '15-login.html';
            }, 3000);
        } else {
            throw new Error('Email sending failed');
        }
        
    } catch (error) {
        console.error('Error:', error);
        notification.textContent = 'Failed to send reset email. Please try again.';
        notification.classList.add('error');
        notification.classList.add('show');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Reset Link';
        setTimeout(() => notification.classList.remove('show'), 5000);
    }
});
