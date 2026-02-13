// Universal Top Bar - Config-driven, project-wide. Single source; no user-specific hardcoding.
// Depends on: project-links.js, global-auth-manager.js. Load project-links first.

(function () {
    'use strict';

    function getHomeHref() {
        return (typeof window.HOME_PAGE !== 'undefined') ? window.HOME_PAGE : '01-index.html';
    }

    function getNavLinks() {
        if (typeof window.NAV_LINKS !== 'undefined' && Array.isArray(window.NAV_LINKS)) {
            return window.NAV_LINKS;
        }
        return [
            { href: '01-index.html', label: 'Home' },
            { href: '01-response-index.html', label: 'Articles' },
            { href: '10-ideological-battle.html', label: 'Battle' },
            { href: '09-ideology-analyzer.html', label: 'Test Ideology' },
            { href: '02-about.html', label: 'About' },
            { href: '04-categories.html', label: 'Categories' }
        ];
    }

    function getLoginHref() {
        const links = window.PROJECT_LINKS || {};
        return (links.login && links.login.href) ? links.login.href : '15-login.html';
    }

    function getProfileHref() {
        const links = window.PROJECT_LINKS || {};
        return (links.profile && links.profile.href) ? links.profile.href : '18-profile.html';
    }

    /** Real photo placeholder (no SVG). Use pravatar.cc for avatar fallback. */
    function getAvatarFallback(name, email) {
        const seed = (email || name || 'user').toString().replace(/[^a-zA-Z0-9]/g, '');
        return 'https://i.pravatar.cc/150?u=' + (seed || 'default');
    }

    class UniversalTopBar {
        constructor() {
            this._interval = null;
            this.init();
        }

        init() {
            this.createTopBar();
            this.updateUserDisplay();
            this.setupEventListeners();
            this._interval = setInterval(() => this.updateUserDisplay(), 60000);
        }

        createTopBar() {
            const sel = 'header, .navbar, .topbar, .universal-bar, nav, .navigation, .header-container, .nav-container';
            document.querySelectorAll(sel).forEach(function (el) {
                if (!el.classList.contains('universal-topbar')) el.remove();
            });
            if (document.querySelector('.universal-topbar')) return;

            const home = getHomeHref();
            const navLinks = getNavLinks();
            console.log('Creating topbar with nav links:', navLinks);
            
            const navHtml = navLinks.map(function (l) {
                return '<a href="' + l.href + '" class="nav-link">' + (l.label || '') + '</a>';
            }).join('');
            
            // Force navigation HTML if empty
            const forceNavHtml = `
                <a href="01-index.html" class="nav-link">Home</a>
                <a href="10-ideological-battle.html" class="nav-link">Battle</a>
                <a href="09-ideology-analyzer.html" class="nav-link">Test</a>
                <a href="02-about.html" class="nav-link">About</a>
                <a href="04-categories.html" class="nav-link">Categories</a>
            `;
            
            const finalNavHtml = navHtml || forceNavHtml;

            const topbar = document.createElement('div');
            topbar.className = 'universal-topbar';
            topbar.innerHTML =
                '<div class="topbar-container">' +
                '<div class="topbar-left">' +
                '<a href="/" class="topbar-logo"><i class="fas fa-phone"></i><span>IAMCALLING</span></a>' +
                '</div>' +
                '<div class="topbar-center">' +
                '<nav class="topbar-nav" id="topbar-nav">' +
                '<a href="01-index.html" class="nav-link">Home</a>' +
                '<a href="10-ideological-battle.html" class="nav-link">Battle</a>' +
                '<a href="09-ideology-analyzer.html" class="nav-link">Test</a>' +
                '<a href="02-about.html" class="nav-link">About</a>' +
                '<a href="04-categories.html" class="nav-link">Categories</a>' +
                '</nav>' +
                '</div>' +
                '<div class="topbar-right">' +
                '<div class="user-display" id="topbar-user-display"><span class="user-status">Loading...</span></div>' +
                '</div></div>';

            const styles = document.createElement('style');
            styles.textContent = [
                '.universal-topbar{position:fixed;top:0;left:0;right:0;z-index:10000;background:linear-gradient(135deg,#0a3d0a,#1a1a1a);color:#fff;box-shadow:0 2px 10px rgba(0,0,0,.3);backdrop-filter:blur(10px);height:70px}',
                '.topbar-container{display:flex;align-items:center;justify-content:space-between;padding:0 20px;height:100%;max-width:1200px;margin:0 auto;width:100%}',
                '.topbar-left{flex:0 0 auto;display:flex;align-items:center}',
                '.topbar-center{flex:1;display:flex!important;justify-content:center;padding:0 20px;visibility:visible!important}',
                '.topbar-right{flex:0 0 auto;display:flex;align-items:center;gap:15px}',
                '.topbar-logo{display:flex;align-items:center;gap:8px;color:#d4af37;text-decoration:none;font-weight:700;font-size:18px;cursor:pointer;z-index:10001}',
                '.topbar-logo:hover{color:#f4cf47;transform:scale(1.05);transition:all 0.3s ease}',
                '.topbar-nav{display:flex!important;gap:15px;align-items:center;background:transparent!important;padding:0!important;visibility:visible!important}',
                '.nav-link{color:#fff!important;text-decoration:none;padding:6px 12px;border-radius:5px;transition:all .3s;font-weight:500;background:transparent!important;font-size:14px;white-space:nowrap}',
                '.nav-link:hover{background:rgba(255,255,255,.1)!important;color:#d4af37!important}',
                '.user-display{display:flex;align-items:center;gap:8px;padding:4px 8px;text-decoration:none;color:#fff;border-radius:20px}',
                '.user-display:hover{background:rgba(255,255,255,.05)}',
                '.user-avatar{width:36px;height:36px;border-radius:50%;border:2px solid #d4af37;object-fit:cover}',
                '.user-name{font-weight:500;font-size:14px;color:#d4af37}',
                '.user-status{color:#ccc;font-size:14px}',
                '.login-btn-topbar{color:#d4af37;text-decoration:none;font-weight:600;padding:8px 16px;border-radius:5px;transition:background .3s;background:rgba(212,175,55,.1);border:1px solid #d4af37}',
                '.login-btn-topbar:hover{background:rgba(212,175,55,.2)}',
                'body{margin-top:70px!important}'
            ].join('');
            document.head.appendChild(styles);
            document.body.insertBefore(topbar, document.body.firstChild);
            
            // Ensure navigation is visible
            setTimeout(() => {
                const nav = topbar.querySelector('.topbar-nav');
                const links = topbar.querySelectorAll('.nav-link');
                if (nav) {
                    nav.style.cssText = 'display: flex !important; gap: 15px; align-items: center; background: transparent !important; padding: 0 !important; visibility: visible !important;';
                }
                links.forEach(link => {
                    link.style.cssText = 'color: #fff !important; text-decoration: none; padding: 6px 12px; border-radius: 5px; font-weight: 500; background: transparent !important; font-size: 14px; white-space: nowrap; display: inline-block !important; visibility: visible !important;';
                });
            }, 100);
            
            // Add mobile menu functionality
            const mobileBtn = document.getElementById('mobile-menu-btn');
            const nav = document.getElementById('topbar-nav');
            if (mobileBtn && nav) {
                mobileBtn.addEventListener('click', function() {
                    nav.classList.toggle('mobile-active');
                });
            }
        }

        async getUser() {
            if (window.globalAuth && window.globalAuth.isLoggedIn()) {
                var user = window.globalAuth.getCurrentUser();
                var name = window.globalAuth.getUserName();
                
                // Always fetch fresh photo from database
                var avatar = getAvatarFallback(name, user.email);
                if (user.email) {
                    var photo = await this.loadProfilePhotoFromSupabase(user.email);
                    if (photo) {
                        avatar = photo;
                    }
                }
                
                return { name: name, avatar: avatar, email: user.email, isLoggedIn: true };
            }
            return { name: 'Guest', avatar: null, email: null, isLoggedIn: false };
        }

        async loadProfilePhotoFromSupabase(email) {
            if (!email) return null;
            
            try {
                var r = await fetch('/api/user-photo/' + encodeURIComponent(email), {
                    cache: 'no-cache'
                });
                
                if (!r.ok) return null;
                
                var result = await r.json();
                
                if (result && result.photo && result.photo.length > 10) {
                    return result.photo;
                }
                
                return null;
            } catch (err) {
                return null;
            }
        }

        async updateUserDisplay() {
            var display = document.getElementById('topbar-user-display');
            if (!display) return;

            if (window.globalAuth && localStorage.getItem('persistentLogin') === 'true' &&
                localStorage.getItem('userAuth') === 'true' && localStorage.getItem('currentUser') &&
                !window.globalAuth.isLoggedIn()) {
                window.globalAuth.loadUserState();
            }

            var user = await this.getUser();
            var profileHref = getProfileHref();
            var loginHref = getLoginHref();

            if (user.isLoggedIn) {
                var avatarUrl = (user.avatar && !/\.svg|svg\+xml|ui-avatars/i.test(String(user.avatar)))
                    ? user.avatar
                    : getAvatarFallback(user.name, user.email);
                var fb = getAvatarFallback(user.name, user.email);
                display.innerHTML =
                    '<a href="' + profileHref + '" style="display:flex;align-items:center;gap:8px;color:#d4af37;text-decoration:none;font-weight:600;">' +
                    '<img src="' + avatarUrl + '" alt="' + (user.name || 'User') + '" class="user-avatar" data-fallback="' + fb + '" onerror="this.onerror=null;this.src=this.dataset.fallback||\'' + fb + '\'">' +
                    '<span class="user-name">' + (user.name || 'User') + '</span></a>';
                return;
            }

            // Not logged in: only Login button
            display.innerHTML = '<span class="user-status">Guest</span>' +
                '<a href="' + loginHref + '" class="login-btn-topbar">Login</a>';
        }

        setupEventListeners() {
            var self = this;
            window.addEventListener('authStateChanged', function () { self.updateUserDisplay(); });
            window.addEventListener('storage', function (e) {
                if (e.key && /user|auth|persistentLogin/.test(e.key)) self.updateUserDisplay();
            });
        }
    }

    function init() {
        var sel = 'header, .navbar, .topbar, .universal-bar, nav, .navigation, .header-container, .nav-container';
        document.querySelectorAll(sel).forEach(function (el) {
            if (!el.classList.contains('universal-topbar')) el.remove();
        });
        if (!window.universalTopBar) window.universalTopBar = new UniversalTopBar();

        document.addEventListener('DOMContentLoaded', function () {
            document.querySelectorAll(sel).forEach(function (el) {
                if (!el.classList.contains('universal-topbar')) el.remove();
            });
            if (!window.universalTopBar) window.universalTopBar = new UniversalTopBar();
        });

        if (document.readyState !== 'loading') {
            document.querySelectorAll(sel).forEach(function (el) {
                if (!el.classList.contains('universal-topbar')) el.remove();
            });
            if (!window.universalTopBar) window.universalTopBar = new UniversalTopBar();
        }
    }

    if (typeof window.NAV_LINKS !== 'undefined' || typeof window.PROJECT_LINKS !== 'undefined') {
        init();
    } else {
        document.addEventListener('DOMContentLoaded', function () { init(); });
        if (document.readyState !== 'loading') init();
    }
    setTimeout(init, 100);
})();
