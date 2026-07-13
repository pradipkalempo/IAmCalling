// Password Reset Request Handler

// Function to send email using EmailJS
async function sendResetEmail(toEmail, userName, resetLink) {
    try {
        // Using EmailJS free service
        // You need to sign up at https://www.emailjs.com/ and get your keys
        const serviceID = 'service_iamcalling'; // Replace with your EmailJS service ID
        const templateID = 'template_password_reset'; // Replace with your EmailJS template ID
        const publicKey = 'YOUR_EMAILJS_PUBLIC_KEY'; // Replace with your EmailJS public key
        
        // Check if EmailJS is configured
        if (!window.emailjs || publicKey === 'YOUR_EMAILJS_PUBLIC_KEY') {
            console.log('EmailJS not configured');
            return false;
        }
        
        const templateParams = {
            to_email: toEmail,
            to_name: userName,
            reset_link: resetLink,
            from_name: 'IAMCALLING'
        };
        
        await emailjs.send(serviceID, templateID, templateParams, publicKey);
        return true;
    } catch (error) {
        console.error('Email sending error:', error);
        return false;
    }
}

document.getElementById('resetForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const submitBtn = e.target.querySelector('.reset-btn');
    const notification = document.getElementById('notification');
    
    // Disable button
    submitBtn.disabled = true;
    submitBtn.textContent = 'Checking account...';
    
    try {
        // Check if user exists in Supabase directly
        const supabaseUrl = 'https://gkckyyyaoqsaouemjnxl.supabase.co';
        const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrY2t5eXlhb3FzYW91ZW1qbnhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyMzA3OTEsImV4cCI6MjA3MjgwNjc5MX0.0z5c-3P1fMSW2qiWg7IT3Oqv-65B3lZ8Lsq2aDvMYQk';
        
        const checkResponse = await fetch(`${supabaseUrl}/rest/v1/users?select=id,email,first_name&email=eq.${encodeURIComponent(email)}`, {
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`
            }
        });
        
        console.log('Supabase response status:', checkResponse.status);
        const users = await checkResponse.json();
        console.log('Users found:', users);
        
        if (!users || users.length === 0) {
            // No account found
            console.log('No account found for email:', email);
            notification.textContent = 'No account found with this email address';
            notification.classList.add('error');
            notification.classList.add('show');
            
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send Reset Link';
            
            setTimeout(() => {
                notification.classList.remove('show');
            }, 5000);
            return;
        }
        
        // Account found - Generate reset token and save to Supabase
        console.log('Account found! User:', users[0]);
        submitBtn.textContent = 'Generating reset link...';
        
        // Generate random token
        const resetToken = Array.from(crypto.getRandomValues(new Uint8Array(32)))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
        
        const resetExpiry = new Date(Date.now() + 3600000).toISOString(); // 1 hour
        
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
        
        console.log('Reset token saved to database');
        
        // Generate reset link
        const resetLink = `${window.location.origin}/reset-password.html?token=${resetToken}`;
        
        // Try to send email using EmailJS (free service)
        submitBtn.textContent = 'Sending email...';
        
        try {
            // Send email using EmailJS
            const emailSent = await sendResetEmail(email, users[0].first_name || 'User', resetLink);
            
            if (emailSent) {
                notification.textContent = '✓ Password reset link sent to your email!';
                notification.classList.remove('error');
                notification.classList.add('show');
                
                submitBtn.textContent = '✓ Email Sent!';
                document.getElementById('email').value = '';
                
                setTimeout(() => {
                    window.location.href = '15-login.html';
                }, 3000);
            } else {
                throw new Error('Email service not configured');
            }
        } catch (emailError) {
            console.log('Email sending failed, showing link instead:', emailError);
            
            // Fallback: Show link on screen
            notification.innerHTML = `
                <div style="text-align: left;">
                    <strong>⚠️ Email service unavailable</strong><br>
                    <small>Copy this reset link:</small><br>
                    <input type="text" value="${resetLink}" 
                           style="width: 100%; padding: 5px; margin-top: 5px; font-size: 11px; border: 1px solid #ddd; border-radius: 4px;"
                           onclick="this.select()" readonly>
                    <small style="color: #999; display: block; margin-top: 5px;">Link expires in 1 hour</small>
                </div>
            `;
            notification.classList.remove('error');
            notification.classList.add('show');
            
            submitBtn.textContent = '✓ Link Generated!';
            
            setTimeout(() => {
                const linkInput = notification.querySelector('input');
                if (linkInput) linkInput.select();
            }, 100);
        }
        
    } catch (error) {
        console.error('Reset request error:', error);
        
        notification.textContent = 'Failed to process request. Please try again.';
        notification.classList.add('error');
        notification.classList.add('show');
        
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Reset Link';
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 5000);
    }
});
