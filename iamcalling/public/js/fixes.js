// Fix for storage and audio issues

// Safe storage wrapper
const SafeStorage = {
    setItem: function(key, value) {
        try {
            if (typeof Storage !== 'undefined' && localStorage) {
                localStorage.setItem(key, value);
                return true;
            }
        } catch (e) {
            console.warn('Storage blocked, using fallback:', e);
            // Fallback to memory storage
            this._memoryStorage = this._memoryStorage || {};
            this._memoryStorage[key] = value;
            return false;
        }
    },
    
    getItem: function(key) {
        try {
            if (typeof Storage !== 'undefined' && localStorage) {
                return localStorage.getItem(key);
            }
        } catch (e) {
            console.warn('Storage blocked, using fallback:', e);
            // Fallback to memory storage
            this._memoryStorage = this._memoryStorage || {};
            return this._memoryStorage[key] || null;
        }
    },
    
    removeItem: function(key) {
        try {
            if (typeof Storage !== 'undefined' && localStorage) {
                localStorage.removeItem(key);
            }
        } catch (e) {
            console.warn('Storage blocked, using fallback:', e);
            if (this._memoryStorage) {
                delete this._memoryStorage[key];
            }
        }
    }
};

// Fix audio context initialization
function initAudioContext() {
    let audioContext = null;
    
    function createAudioContext() {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }
            return audioContext;
        } catch (e) {
            console.warn('AudioContext not supported:', e);
            return null;
        }
    }
    
    // Wait for user interaction
    function enableAudio() {
        if (!audioContext) {
            audioContext = createAudioContext();
        }
        document.removeEventListener('click', enableAudio);
        document.removeEventListener('touchstart', enableAudio);
    }
    
    document.addEventListener('click', enableAudio);
    document.addEventListener('touchstart', enableAudio);
    
    return {
        getContext: () => audioContext,
        isReady: () => audioContext && audioContext.state === 'running'
    };
}

// Fix messenger scrolling
function fixMessengerScrolling() {
    const messagesContainer = document.querySelector('.messages-container');
    const typingBar = document.querySelector('.typing-bar');
    
    if (messagesContainer && typingBar) {
        // Adjust messages container height
        function adjustHeight() {
            const typingBarHeight = typingBar.offsetHeight;
            messagesContainer.style.paddingBottom = (typingBarHeight + 20) + 'px';
        }
        
        // Initial adjustment
        adjustHeight();
        
        // Adjust on window resize
        window.addEventListener('resize', adjustHeight);
        
        // Auto-scroll to bottom when new messages arrive
        const observer = new MutationObserver(() => {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        });
        
        observer.observe(messagesContainer, {
            childList: true,
            subtree: true
        });
    }
}

// Initialize fixes
document.addEventListener('DOMContentLoaded', function() {
    initAudioContext();
    fixMessengerScrolling();
});

// Export for use in other scripts
window.SafeStorage = SafeStorage;