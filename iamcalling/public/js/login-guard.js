/**
 * Login/Register guard: if user already logged in, redirect to home.
 * Include only on 15-login.html and 16-register.html. Runs after global-auth-manager.
 */
(function () {
    'use strict';

    function currentPage() {
        var p = window.location.pathname || '';
        var m = p.match(/\/([^/]+\.html)$/);
        return m ? m[1] : (window.location.href.split('/').pop() || '').split('?')[0];
    }

    function redirectIfLoggedIn() {
        var list = window.REDIRECT_IF_LOGGED_IN;
        var home = window.HOME_PAGE || '01-index.html';
        if (!Array.isArray(list) || list.length === 0) return;
        var page = currentPage();
        if (list.indexOf(page) === -1) return;
        if (window.globalAuth && window.globalAuth.isLoggedIn()) {
            window.location.replace(home);
        }
    }

    function run() {
        if (window.globalAuth) {
            redirectIfLoggedIn();
            return;
        }
        var attempts = 0;
        function wait() {
            attempts++;
            if (window.globalAuth) {
                redirectIfLoggedIn();
                return;
            }
            if (attempts < 50) setTimeout(wait, 100);
        }
        setTimeout(wait, 50);
        document.addEventListener('DOMContentLoaded', redirectIfLoggedIn);
    }

    run();
})();
