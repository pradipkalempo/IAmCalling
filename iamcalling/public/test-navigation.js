// Universal Navigation Injector - DISABLED to prevent conflicts
(function() {
    'use strict';
    
    // DISABLED: This was causing conflicts with universal-topbar.js
    console.log('⚠️ Test navigation disabled to prevent conflicts with universal topbar');
    
    // Only keep the testing functions for debugging
})();

// Navigation Visibility Test
function testNavigationVisibility() {
    console.log('🔍 Testing Navigation Visibility...');
    
    // Check if universal topbar exists
    const topbar = document.querySelector('.universal-topbar');
    console.log('Universal Topbar:', topbar);
    
    if (topbar) {
        console.log('Topbar HTML:', topbar.innerHTML);
        
        // Check topbar center
        const center = topbar.querySelector('.topbar-center');
        console.log('Topbar Center:', center);
        if (center) {
            console.log('Center HTML:', center.innerHTML);
            console.log('Center Styles:', window.getComputedStyle(center));
        }
        
        // Check navigation
        const nav = topbar.querySelector('.topbar-nav');
        console.log('Navigation:', nav);
        if (nav) {
            console.log('Nav HTML:', nav.innerHTML);
            console.log('Nav Styles:', window.getComputedStyle(nav));
            
            // Check nav links
            const links = nav.querySelectorAll('.nav-link');
            console.log('Nav Links Count:', links.length);
            links.forEach((link, i) => {
                console.log(`Link ${i}:`, link);
                console.log(`Link ${i} Text:`, link.textContent);
                console.log(`Link ${i} Styles:`, window.getComputedStyle(link));
            });
        }
    }
    
    // Force create navigation if missing
    if (!topbar || !topbar.querySelector('.topbar-nav')) {
        console.log('🚨 Creating emergency navigation...');
        createEmergencyNav();
    }
}

function createEmergencyNav() {
    // Remove existing topbar
    const existing = document.querySelector('.universal-topbar');
    if (existing) existing.remove();
    
    // Get real user data
    let userPhoto = 'https://i.pravatar.cc/150?u=guest';
    
    try {
        if (window.globalAuth && window.globalAuth.isLoggedIn()) {
            const user = window.globalAuth.getCurrentUser();
            userPhoto = user.profile_photo || 'https://i.pravatar.cc/150?u=' + (user.email || user.name || 'user');
        }
    } catch (e) {
        console.log('Using fallback user photo');
    }
    
    // Create new topbar with visible navigation
    const topbar = document.createElement('div');
    topbar.className = 'universal-topbar';
    topbar.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:10000;background:linear-gradient(135deg,#0a3d0a,#1a1a1a);color:#fff;height:70px;display:flex;align-items:center;justify-content:space-between;padding:0 20px;';
    
    topbar.innerHTML = `
        <div style="display:flex;align-items:center;gap:8px;color:#d4af37;font-weight:700;font-size:18px;">
            <i class="fas fa-phone"></i><span>IAMCALLING</span>
        </div>
        <div style="display:flex;gap:20px;align-items:center;">
            <a href="10-political-battle.html" style="color:#fff;text-decoration:none;padding:8px 16px;border-radius:5px;font-weight:500;">Battle</a>
            <a href="09-ideology-analyzer.html" style="color:#fff;text-decoration:none;padding:8px 16px;border-radius:5px;font-weight:500;">Test</a>
            <a href="04-categories.html" style="color:#fff;text-decoration:none;padding:8px 16px;border-radius:5px;font-weight:500;">Categories</a>
        </div>
        <div style="display:flex;align-items:center;gap:8px;color:#d4af37;">
            <a href="18-profile.html" style="display:flex;align-items:center;">
                <img src="${userPhoto}" alt="Profile" style="width:36px;height:36px;border-radius:50%;border:2px solid #d4af37;object-fit:cover;cursor:pointer;" onerror="this.src='https://i.pravatar.cc/150?u=user'">
            </a>
        </div>
    `;
    
    document.body.insertBefore(topbar, document.body.firstChild);
    document.body.style.marginTop = '70px';
    
    console.log('✅ Emergency navigation with real user photo created');
}

// Run test after page loads - DISABLED
// setTimeout(testNavigationVisibility, 2000);

// Add to window for manual testing
window.testNavigationVisibility = testNavigationVisibility;
window.createEmergencyNav = createEmergencyNav;