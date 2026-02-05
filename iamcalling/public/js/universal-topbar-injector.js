// Universal Topbar Injector – single bootstrap for project-links, global auth, topbar.
// Load order: project-links → global-auth → topbar. No redundant validators.

(function () {
    'use strict';

    var base = 'js/';
    var scripts = [base + 'project-links.js', base + 'global-auth-manager.js', base + 'universal-topbar.js'];

    function hasScript(name) {
        return !!document.querySelector('script[src*="' + name.replace(/.*\//, '') + '"]');
    }

    function inject() {
        var sel = 'header:not(.universal-topbar), .navbar:not(.universal-topbar), .topbar:not(.universal-topbar), .universal-bar, nav:not(.universal-topbar), .navigation:not(.universal-topbar), .header-container:not(.universal-topbar), .nav-container:not(.universal-topbar)';
        try {
            document.querySelectorAll(sel).forEach(function (el) { el.remove(); });
        } catch (e) {}

        function addNext(i) {
            if (i >= scripts.length) return;
            var src = scripts[i];
            var name = src.replace(/.*\//, '');
            if (hasScript(name)) {
                addNext(i + 1);
                return;
            }
            var s = document.createElement('script');
            s.src = src;
            s.onload = function () { addNext(i + 1); };
            s.onerror = function () { addNext(i + 1); };
            document.head.appendChild(s);
        }

        addNext(0);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inject);
    } else {
        inject();
    }
})();
