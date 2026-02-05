// Manual Message Refresh for Testing
window.refreshMessages = async function() {
    if (!window.messenger || !window.messenger.activeChat) {
        console.log('❌ No active chat to refresh');
        return;
    }
    
    console.log('🔄 Manually refreshing messages...');
    await window.messenger.loadMessages(window.messenger.activeChat);
    console.log('✅ Messages refreshed');
};

// Auto-refresh messages every 5 seconds for testing
window.startAutoRefresh = function() {
    if (window.messageRefreshInterval) {
        clearInterval(window.messageRefreshInterval);
    }
    
    window.messageRefreshInterval = setInterval(() => {
        if (window.messenger && window.messenger.activeChat) {
            console.log('🔄 Auto-refreshing messages...');
            window.messenger.loadMessages(window.messenger.activeChat);
        }
    }, 5000);
    
    console.log('✅ Auto-refresh started (every 5 seconds)');
};

window.stopAutoRefresh = function() {
    if (window.messageRefreshInterval) {
        clearInterval(window.messageRefreshInterval);
        window.messageRefreshInterval = null;
        console.log('⏹️ Auto-refresh stopped');
    }
};