document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('profileForm');
    const messageDiv = document.getElementById('notification');

    // Check authentication
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
        document.body.innerHTML = '<div class="error">Please log in</div>';
        return;
    }

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const firstName = document.getElementById('firstName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const phone = document.getElementById('phone').value.trim();

        // Clear previous messages
        messageDiv.innerHTML = '';

        // Validation
        if (!firstName) {
            showError('First name is required');
            return;
        }

        if (!lastName) {
            showError('Last name is required');
            return;
        }

        if (!phone) {
            showError('Phone is required');
            return;
        }

        // Success
        showSuccess('Profile settings saved successfully!');
    });

    function showError(message) {
        messageDiv.innerHTML = '<div class="error">' + message + '</div>';
    }

    function showSuccess(message) {
        messageDiv.innerHTML = '<div class="success">' + message + '</div>';
    }
});
