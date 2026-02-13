/**
 * Project Links Config - Single source for nav and routes.
 * Bucket approach: add/remove links here; topbar and app read from this.
 * No hardcoded page lists elsewhere. Supabase-first; deployment-ready.
 */
(function () {
    'use strict';

    const PROJECT_LINKS = {
        home: { href: '01-index.html', label: 'Home' },
        articles: { href: '01-response-index.html', label: 'Articles' },
        battle: { href: '10-ideological-battle.html', label: 'Battle' },
        ideologyAnalyzer: { href: '09-ideology-analyzer.html', label: 'Test Ideology' },
        about: { href: '02-about.html', label: 'About' },
        categories: { href: '04-categories.html', label: 'Categories' },
        analytics: { href: '29-analytics_dashboard.html', label: 'Analytics' },
        writeArticle: { href: '22-write_article.html', label: 'Write Article' },
        profile: { href: '18-profile.html', label: 'Profile' },
        messenger: { href: '34-icalluser-messenger.html', label: 'Messenger' },
        profileSettings: { href: '19-user_settings.html', label: 'Settings' },
        passwordReset: { href: '20-password_reset.html', label: 'Password Reset' },
        rewardClaim: { href: '35-reward-claim.html', label: 'Reward Claim' },
        login: { href: '15-login.html', label: 'Login' },
        register: { href: '16-register.html', label: 'Register' }
    };

    /** Main nav links shown in universal topbar (order preserved) */
    const NAV_LINKS = [
        PROJECT_LINKS.home,
        PROJECT_LINKS.articles,
        PROJECT_LINKS.battle,
        PROJECT_LINKS.ideologyAnalyzer,
        PROJECT_LINKS.about,
        PROJECT_LINKS.categories
    ];

    /** Pages that must redirect to home if user is already logged in */
    const REDIRECT_IF_LOGGED_IN = [
        '15-login.html',
        '16-register.html'
    ];

    /** Home page (logout redirect target) */
    const HOME_PAGE = PROJECT_LINKS.home.href;

    window.PROJECT_LINKS = PROJECT_LINKS;
    window.NAV_LINKS = NAV_LINKS;
    window.REDIRECT_IF_LOGGED_IN = REDIRECT_IF_LOGGED_IN;
    window.HOME_PAGE = HOME_PAGE;
})();
