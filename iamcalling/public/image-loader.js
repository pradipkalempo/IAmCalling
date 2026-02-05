// Enhanced Image Loading with Multiple Fallbacks
(function() {
    'use strict';
    
    console.log('🖼️ Initializing enhanced image loading...');
    
    const ImageLoader = {
        fallbackSources: [
            // Avatar fallbacks
            'https://ui-avatars.com/api/?name={name}&background=d4af37&color=fff&size=150',
            'https://robohash.org/{id}?size=150x150',
            'https://api.dicebear.com/7.x/initials/svg?seed={name}',
            // Generic image fallbacks
            'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150"><rect width="150" height="150" fill="%23d4af37"/><text x="75" y="85" font-family="Arial" font-size="60" fill="white" text-anchor="middle">👤</text></svg>',
            'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150"><circle cx="75" cy="75" r="75" fill="%23d4af37"/><text x="75" y="85" font-family="Arial" font-size="60" fill="white" text-anchor="middle">?</text></svg>'
        ],
        
        init: function() {
            this.setupImageErrorHandling();
            this.setupLazyLoading();
            this.setupProgressiveLoading();
            console.log('✅ Image loading system initialized');
        },
        
        setupImageErrorHandling: function() {
            // Handle all image loading errors with multiple fallbacks
            const handleImageError = (img) => {
                if (img.dataset.errorHandled) return;
                
                img.dataset.errorHandled = 'true';
                const originalSrc = img.src;
                const attemptCount = parseInt(img.dataset.attemptCount || '0') + 1;
                img.dataset.attemptCount = attemptCount;
                
                // Generate fallback based on image type
                let fallbackSrc;
                
                if (originalSrc.includes('pravatar.cc') || originalSrc.includes('i.pravatar.cc')) {
                    // Avatar image fallback
                    const name = img.alt || 'User';
                    const id = Math.random().toString(36).substr(2, 9);
                    fallbackSrc = this.fallbackSources[0]
                        .replace('{name}', encodeURIComponent(name))
                        .replace('{id}', id);
                } else {
                    // Generic image fallback
                    const fallbackIndex = Math.min(attemptCount, this.fallbackSources.length - 1);
                    fallbackSrc = this.fallbackSources[fallbackIndex];
                    
                    if (fallbackSrc.includes('{')) {
                        const name = img.alt || 'Image';
                        const id = Math.random().toString(36).substr(2, 9);
                        fallbackSrc = fallbackSrc
                            .replace('{name}', encodeURIComponent(name))
                            .replace('{id}', id);
                    }
                }
                
                // Apply fallback
                img.src = fallbackSrc;
                
                // Add visual indication that this is a fallback
                img.style.opacity = '0.8';
                img.title = `Original image failed to load. Fallback attempt ${attemptCount}`;
                
                console.log(`🔄 Image fallback applied (${attemptCount}/${this.fallbackSources.length}):`, originalSrc);
            };
            
            // Set up error handlers for existing images
            const existingImages = document.querySelectorAll('img');
            existingImages.forEach(img => {
                img.addEventListener('error', () => handleImageError(img));
            });
            
            // Set up mutation observer for dynamically added images (with safety check)
            if (typeof MutationObserver !== 'undefined' && document.body) {
                const observer = new MutationObserver((mutations) => {
                    mutations.forEach((mutation) => {
                        mutation.addedNodes.forEach((node) => {
                            if (node.nodeType === Node.ELEMENT_NODE) {
                                if (node.tagName === 'IMG') {
                                    node.addEventListener('error', () => handleImageError(node));
                                }
                                // Check for images within added elements
                                const nestedImages = node.querySelectorAll && node.querySelectorAll('img');
                                if (nestedImages) {
                                    nestedImages.forEach(img => {
                                        img.addEventListener('error', () => handleImageError(img));
                                    });
                                }
                            }
                        });
                    });
                });
                
                observer.observe(document.body, {
                    childList: true,
                    subtree: true
                });
            }
        },
        
        setupLazyLoading: function() {
            // Implement proper lazy loading with fallback
            if ('IntersectionObserver' in window) {
                const imageObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const img = entry.target;
                            if (img.dataset.src) {
                                img.src = img.dataset.src;
                                img.classList.remove('lazy');
                                imageObserver.unobserve(img);
                            }
                        }
                    });
                });
                
                // Observe all images with data-src attribute
                const lazyImages = document.querySelectorAll('img[data-src]');
                lazyImages.forEach(img => {
                    imageObserver.observe(img);
                });
            } else {
                // Fallback for browsers without IntersectionObserver
                const lazyImages = document.querySelectorAll('img[data-src]');
                lazyImages.forEach(img => {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                });
            }
        },
        
        setupProgressiveLoading: function() {
            // Add loading states and progressive enhancement
            const images = document.querySelectorAll('img');
            images.forEach(img => {
                // Add loading attribute for modern browsers
                if (!img.hasAttribute('loading')) {
                    img.setAttribute('loading', 'lazy');
                }
                
                // Add loading classes
                img.classList.add('image-loading');
                
                img.addEventListener('load', function() {
                    this.classList.remove('image-loading');
                    this.classList.add('image-loaded');
                });
                
                // Handle loading errors
                img.addEventListener('error', function() {
                    this.classList.remove('image-loading');
                    this.classList.add('image-error');
                });
            });
        },
        
        // Public method to manually load an image with fallbacks
        loadImageWithFallback: function(imgElement, originalSrc) {
            return new Promise((resolve, reject) => {
                if (!imgElement || !originalSrc) {
                    reject(new Error('Invalid parameters'));
                    return;
                }
                
                let attemptCount = 0;
                const maxAttempts = this.fallbackSources.length;
                
                const tryLoad = (src) => {
                    attemptCount++;
                    imgElement.src = src;
                    
                    imgElement.onload = () => {
                        resolve({ success: true, src: src, attempts: attemptCount });
                    };
                    
                    imgElement.onerror = () => {
                        if (attemptCount < maxAttempts) {
                            // Try next fallback
                            const nextFallback = this.fallbackSources[attemptCount - 1];
                            tryLoad(nextFallback);
                        } else {
                            // All fallbacks failed
                            reject(new Error(`Failed to load image after ${maxAttempts} attempts`));
                        }
                    };
                };
                
                tryLoad(originalSrc);
            });
        },
        
        // Preload important images
        preloadImages: function(imageUrls) {
            if (!Array.isArray(imageUrls)) return;
            
            imageUrls.forEach(url => {
                const img = new Image();
                img.src = url;
                // Don't append to DOM, just load in memory
            });
        }
    };
    
    // Initialize image loading system
    ImageLoader.init();
    
    // Make available globally
    window.ImageLoader = ImageLoader;
    
    // Add CSS for image loading states
    const style = document.createElement('style');
    style.textContent = `
        .image-loading {
            background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
            background-size: 200% 100%;
            animation: loading 1.5s infinite;
        }
        
        .image-loaded {
            opacity: 1;
            transition: opacity 0.3s ease;
        }
        
        .image-error {
            opacity: 0.5;
            filter: grayscale(100%);
        }
        
        @keyframes loading {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
        }
        
        img {
            transition: opacity 0.3s ease;
        }
    `;
    document.head.appendChild(style);
    
    // Export for module usage
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = ImageLoader;
    }
    
})();