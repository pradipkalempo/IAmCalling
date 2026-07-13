// Bulletproof Universal Authentication System
// Single source of truth for all pages

class UniversalAuth {
    constructor() {
        this.user = null;
        this.isLoggedIn = false;
        this.storage = this.createSafeStorage();
        this.init();
    }

    // Create safe storage that works with tracking prevention
    createSafeStorage() {
        const memoryStorage = {};
        return {
            getItem: (key) => {
                try {
                    return localStorage.getItem(key) || memoryStorage[key] || null;
                } catch (e) {
                    return memoryStorage[key] || null;
                }
            },
            setItem: (key, value) => {
                try {
                    localStorage.setItem(key, value);
                    memoryStorage[key] = value;
                } catch (e) {
                    memoryStorage[key] = value;
                }
            },
            removeItem: (key) => {
                try {
                    localStorage.removeItem(key);
                    delete memoryStorage[key];
                } catch (e) {
                    delete memoryStorage[key];
                }
            }
        };
    }

    init() {
        this.loadUser();
        this.createTopbar();
        this.startSync();
        this.setupListeners();
    }

    // Load user from storage
    loadUser() {
        const userData = this.storage.getItem('currentUser');
        const authFlag = this.storage.getItem('userAuth');
        
        if (userData && authFlag === 'true') {
            try {
                this.user = JSON.parse(userData);
                this.isLoggedIn = true;
            } catch (e) {
                this.user = null;
                this.isLoggedIn = false;
            }
        } else {
            this.user = null;
            this.isLoggedIn = false;
        }
    }

    // Set user login
    setUser(userData) {
        this.user = userData;
        this.isLoggedIn = true;
        this.storage.setItem('currentUser', JSON.stringify(userData));
        this.storage.setItem('userAuth', 'true');
        this.updateUI();
        this.broadcast();
    }

    // Logout user
    logout() {
        this.user = null;
        this.isLoggedIn = false;
        this.storage.removeItem('currentUser');
        this.storage.removeItem('userAuth');
        this.updateUI();
        this.broadcast();
        window.location.href = '15-login.html';
    }

    // Create universal topbar
    createTopbar() {
        // Remove existing navigation
        document.querySelectorAll('header, nav, .navbar, .topbar').forEach(el => {
            if (!el.classList.contains('universal-bar')) el.remove();
        });

        const topbar = document.createElement('div');
        topbar.className = 'universal-bar';
        topbar.innerHTML = `
            <div class="bar-container">
                <a href="01-index.html" class="logo">IAMCALLING</a>
                <nav class="nav-links">
                    <a href="01-index.html">Home</a>
                    <a href="01-response-index.html">Articles</a>
                    <a href="02-about.html">About</a>
                    <a href="04-categories.html">Categories</a>
                    <a href="09-ideology-analyzer.html">Analyzer</a>
                    <a href="10-political-battle.html">Battle</a>
                    <a href="22-write_article.html">Write</a>
                    <a href="29-analytics_dashboard.html">Analytics</a>
                    <a href="34-icalluser-messenger.html">Messenger</a>
                </nav>
                <div class="auth-section" id="auth-section">Loading...</div>
            </div>
        `;

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .universal-bar {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                z-index: 10000;
                background: linear-gradient(135deg, #0a1f0a, #1a3a1a);
                color: white;
                box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            }
            .bar-container {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 0 20px;
                height: 60px;
                max-width: 1200px;
                margin: 0 auto;
            }
            .logo {
                color: #d4af37;
                text-decoration: none;
                font-weight: bold;
                font-size: 18px;
            }
            .nav-links {
                display: flex;
                gap: 20px;
            }
            .nav-links a {
                color: white;
                text-decoration: none;
                padding: 8px 12px;
                border-radius: 5px;
                transition: background 0.3s;
            }
            .nav-links a:hover {
                background: rgba(255,255,255,0.1);
            }
            .auth-section {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .auth-btn {
                padding: 8px 16px;
                border-radius: 5px;
                text-decoration: none;
                font-weight: 500;
                transition: all 0.3s;
            }
            .login-btn {
                background: #2d5a2d;
                color: white;
            }
            .register-btn {
                background: #d4af37;
                color: black;
            }
            .user-info {
                display: flex;
                align-items: center;
                gap: 8px;
                color: #d4af37;
            }
            .user-avatar {
                width: 32px;
                height: 32px;
                border-radius: 50%;
                border: 2px solid #d4af37;
            }
            .logout-btn {
                background: #dc2626;
                color: white;
                border: none;
                padding: 6px 12px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
            }
            body {
                margin-top: 60px !important;
            }
            @media (max-width: 768px) {
                .nav-links {
                    display: none;
                }
                .bar-container {
                    padding: 0 15px;
                }
            }
        `;

        document.head.appendChild(style);
        document.body.insertBefore(topbar, document.body.firstChild);
        this.updateUI();
    }

    // Update UI based on auth state
    updateUI() {
        const authSection = document.getElementById('auth-section');
        if (!authSection) return;

        if (this.isLoggedIn && this.user) {
            const userName = this.user.name || this.user.full_name || 'User';
            const seed = (this.user.email || userName || 'user').toString().replace(/[^a-zA-Z0-9]/g, '') || 'user';
            const userPhoto = (this.user.profile_photo && !/\.svg|ui-avatars/i.test(this.user.profile_photo)) ? this.user.profile_photo : `https://i.pravatar.cc/150?u=${seed}`;
            
            authSection.innerHTML = `
                <div class="user-info">
                    <img src="${userPhoto}" alt="${userName}" class="user-avatar">
                    <a href="18-profile.html" style="color: #d4af37; text-decoration: none;">${userName}</a>
                    <a href="19-user_settings.html" style="color: #ccc; text-decoration: none;">⚙️</a>
                </div>
                <button class="logout-btn" onclick="window.universalAuth.logout()">Logout</button>
            `;
        } else {
            authSection.innerHTML = `
                <a href="15-login.html" class="auth-btn login-btn">Login</a>
                <a href="16-register.html" class="auth-btn register-btn">Register</a>
            `;
        }
    }

    // Sync every second
    startSync() {
        setInterval(() => {
            const currentState = this.isLoggedIn;
            this.loadUser();
            if (currentState !== this.isLoggedIn) {
                this.updateUI();
            }
        }, 1000);
    }

    // Setup event listeners
    setupListeners() {
        // Listen for storage changes
        window.addEventListener('storage', () => {
            this.loadUser();
            this.updateUI();
        });

        // Listen for page visibility
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.loadUser();
                this.updateUI();
            }
        });
    }

    // Broadcast changes
    broadcast() {
        window.dispatchEvent(new CustomEvent('authChanged', {
            detail: { isLoggedIn: this.isLoggedIn, user: this.user }
        }));
    }
}

// Initialize immediately
window.universalAuth = new UniversalAuth();

// Also run after DOM loads
document.addEventListener('DOMContentLoaded', () => {
    if (!window.universalAuth) {
        window.universalAuth = new UniversalAuth();
    }
});

console.log('✅ Universal Auth System loaded');