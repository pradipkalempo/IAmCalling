// Audio Context Fix for Alan AI and Browser Audio Issues
(function() {
    'use strict';
    
    console.log('🔊 Initializing audio context fixes...');
    
    const AudioFix = {
        audioContext: null,
        isInitialized: false,
        
        init: function() {
            this.setupAudioContext();
            this.fixAlanAI();
            this.setupUserInteractionHandler();
            console.log('✅ Audio fixes initialized');
        },
        
        setupAudioContext: function() {
            try {
                // Create AudioContext with proper handling
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                if (AudioContext) {
                    this.audioContext = new AudioContext();
                    window.audioContext = this.audioContext;
                    console.log('✅ AudioContext created successfully');
                }
            } catch (error) {
                console.warn('⚠️ Could not create AudioContext:', error);
            }
        },
        
        fixAlanAI: function() {
            // Handle Alan AI specific issues
            const fixAlanAIContext = () => {
                // Look for Alan AI elements and fix their audio initialization
                const alanElements = document.querySelectorAll('[id*="alan"], [class*="alan"]');
                
                alanElements.forEach(element => {
                    // Add error handling for Alan AI
                    element.addEventListener('error', function(e) {
                        console.warn('Alan AI error suppressed:', e);
                        e.preventDefault();
                    });
                });
                
                // Suppress Alan AI console warnings
                if (typeof window.console !== 'undefined') {
                    const originalWarn = console.warn;
                    console.warn = function() {
                        const args = Array.from(arguments);
                        const message = args.join(' ');
                        
                        // Suppress Alan AI specific warnings
                        if (message.includes('Alan:') || 
                            message.includes('audio worker') ||
                            message.includes('AudioContext was not allowed to start')) {
                            return;
                        }
                        
                        originalWarn.apply(console, arguments);
                    };
                }
            };
            
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', fixAlanAIContext);
            } else {
                fixAlanAIContext();
            }
        },
        
        setupUserInteractionHandler: function() {
            // Handle AudioContext resume requirement after user interaction
            const resumeAudioContext = () => {
                if (this.audioContext && this.audioContext.state === 'suspended') {
                    this.audioContext.resume()
                        .then(() => {
                            console.log('✅ AudioContext resumed successfully');
                        })
                        .catch(error => {
                            console.warn('⚠️ AudioContext resume failed:', error);
                        });
                }
            };
            
            // Add multiple event listeners for user interaction
            const interactionEvents = ['click', 'touchstart', 'keydown', 'mousedown'];
            
            interactionEvents.forEach(eventType => {
                document.addEventListener(eventType, resumeAudioContext, { 
                    once: true,
                    passive: true 
                });
            });
            
            // Also try to resume on page visibility change
            document.addEventListener('visibilitychange', () => {
                if (document.visibilityState === 'visible') {
                    setTimeout(resumeAudioContext, 100);
                }
            });
        },
        
        // Public method to manually resume audio context
        resumeAudio: function() {
            if (this.audioContext) {
                return this.audioContext.resume();
            }
            return Promise.resolve();
        },
        
        // Public method to check audio context state
        getAudioState: function() {
            if (this.audioContext) {
                return this.audioContext.state;
            }
            return 'unavailable';
        }
    };
    
    // Initialize audio fixes
    AudioFix.init();
    
    // Make available globally
    window.AudioFix = AudioFix;
    
    // Export for module usage
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = AudioFix;
    }
    
})();