// Password Reset - Backend API Version

document.getElementById('resetForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const submitBtn = e.target.querySelector('.reset-btn');
    const notification = document.getElementById('notification');
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending reset email...';
    
    try {
        const response = await fetch('/api/password-reset/request-reset', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });
        
        const data = await response.json();
        
        if (data.success) {
            notification.textContent = '✓ Password reset link sent to your email!';
            notification.classList.remove('error');
            notification.classList.add('show');
            
            submitBtn.textContent = '✓ Email Sent!';
            document.getElementById('email').value = '';
            
            setTimeout(() => {
                window.location.href = '15-login.html';
            }, 3000);
        } else {
            notification.textContent = data.message || 'Failed to send reset email';
            notification.classList.add('error');
            notification.classList.add('show');
            
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send Reset Link';
            
            setTimeout(() => {
                notification.classList.remove('show');
            }, 5000);
        }
        
    } catch (error) {
        console.error('Error:', error);
        notification.textContent = 'Failed to send reset email. Please try again.';
        notification.classList.add('error');
        notification.classList.add('show');
        
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Reset Link';
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 5000);
    }
});
