document.addEventListener('DOMContentLoaded', function() {
    const submitButton = document.querySelector('.submit-btn');
    const formFields = [
        document.getElementById('userName'),
        document.getElementById('userEmail'),
        document.getElementById('assignedIdeology'),
        document.getElementById('challengeTitle'),
        document.getElementById('challengeArgument')
    ];

    // Disable the button initially
    submitButton.disabled = true;
    submitButton.style.opacity = '0.5';
    submitButton.style.cursor = 'not-allowed';

    // Function to check if all fields are filled
    function areFieldsFilled() {
        return formFields.every(field => field.value.trim() !== '');
    }

    // Add event listeners to all fields
    formFields.forEach(field => {
        field.addEventListener('input', function() {
            if (areFieldsFilled()) {
                submitButton.disabled = false;
                submitButton.style.opacity = '1';
                submitButton.style.cursor = 'pointer';
            } else {
                submitButton.disabled = true;
                submitButton.style.opacity = '0.5';
                submitButton.style.cursor = 'not-allowed';
            }
        });
    });

    // Redirect on button click
    submitButton.addEventListener('click', function(event) {
        event.preventDefault();
        if (areFieldsFilled()) {
            window.location.href = '18-profile.html';
        }
    });
});
