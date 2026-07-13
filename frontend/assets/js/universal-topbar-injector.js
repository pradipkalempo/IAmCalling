// Universal Topbar Injector – Optimized parallel loading
(function () {
    'use strict';
    var scripts = ['js/project-links.js', 'js/global-auth-manager.js', 'js/universal-topbar.js'];
    var loaded = 0;

    function hasScript(src) {
        return !!document.querySelector('script[src="' + src + '"]');
    }

    function inject() {
        // Remove old navbars once
        var sel = 'header:not(.universal-topbar), .navbar:not(.universal-topbar), .topbar:not(.universal-topbar), .universal-bar, nav:not(.universal-topbar)';
        document.querySelectorAll(sel).forEach(function (el) { el.remove(); });

        // Load all scripts in parallel
        scripts.forEach(function(src) {
            if (hasScript(src)) {
                loaded++;
                return;
            }
            var s = document.createElement('script');
            s.src = src;
            s.async = false; // Maintain execution order
            s.onload = s.onerror = function() { loaded++; };
            document.head.appendChild(s);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inject);
    } else {
        inject();
    }
})();
