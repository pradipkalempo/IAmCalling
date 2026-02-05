// Real-time View Tracking Monitor
(function() {
    'use strict';
    
    console.log('🔍 Starting real-time view tracking monitor...');
    
    // Create monitoring overlay with safety check
    function createMonitor() {
        if (document.getElementById('view-tracking-monitor')) {
            return; // Already exists
        }
        
        const monitor = document.createElement('div');
        monitor.id = 'view-tracking-monitor';
        monitor.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            width: 300px;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 15px;
            border-radius: 10px;
            font-family: monospace;
            font-size: 12px;
            z-index: 999999;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
            max-height: 400px;
            overflow-y: auto;
        `;
        
        monitor.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <h3 style="margin: 0; color: #4CAF50;">📊 View Tracking Monitor</h3>
                <button id="close-monitor" style="background: #f44336; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer;">×</button>
            </div>
            <div id="monitor-content">
                <div>🕒 Monitoring started...</div>
            </div>
            <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #444;">
                <button id="test-view" style="background: #2196F3; color: white; border: none; padding: 8px 12px; border-radius: 5px; cursor: pointer; margin-right: 5px;">Test View</button>
                <button id="clear-logs" style="background: #FF9800; color: white; border: none; padding: 8px 12px; border-radius: 5px; cursor: pointer;">Clear Logs</button>
            </div>
        `;
        
        // Safety check before appending
        if (document.body) {
            document.body.appendChild(monitor);
        } else {
            // Wait for body to be ready
            document.addEventListener('DOMContentLoaded', () => {
                if (document.body) {
                    document.body.appendChild(monitor);
                }
            });
        }
        
        return monitor;
    }
    
    // Initialize monitor when DOM is ready
    function initMonitor() {
        const monitor = createMonitor();
        if (!monitor) return;
        
        const content = document.getElementById('monitor-content');
        const closeBtn = document.getElementById('close-monitor');
        const testBtn = document.getElementById('test-view');
        const clearBtn = document.getElementById('clear-logs');
        
        if (!content || !closeBtn || !testBtn || !clearBtn) {
            console.warn('⚠️ View monitor elements not found');
            return;
        }
        
        // Close monitor
        closeBtn.addEventListener('click', () => {
            monitor.style.display = 'none';
        });
        
        // Test view tracking
        testBtn.addEventListener('click', async () => {
            logMessage('🧪 Testing view tracking...');
            try {
                if (window.SimpleViewTracker) {
                    const result = await window.SimpleViewTracker.trackView('monitor-test-' + Date.now(), 'post');
                    logMessage(`✅ View tracked: ${JSON.stringify(result)}`);
                } else if (window.ViewTracker) {
                    const result = await window.ViewTracker.trackView('monitor-test-' + Date.now(), 'post');
                    logMessage(`✅ View tracked: ${JSON.stringify(result)}`);
                } else {
                    logMessage('❌ No view tracker available');
                }
            } catch (error) {
                logMessage(`❌ View tracking error: ${error.message}`);
            }
        });
        
        // Clear logs
        clearBtn.addEventListener('click', () => {
            content.innerHTML = '<div>🕒 Logs cleared...</div>';
        });
        
        // Log message function
        function logMessage(message) {
            const timestamp = new Date().toLocaleTimeString();
            const logEntry = document.createElement('div');
            logEntry.style.cssText = 'margin: 5px 0; padding: 5px; background: rgba(255, 255, 255, 0.1); border-radius: 3px;';
            logEntry.innerHTML = `[${timestamp}] ${message}`;
            content.appendChild(logEntry);
            content.scrollTop = content.scrollHeight;
            
            // Also log to console
            console.log(`[Monitor] ${message}`);
        }
        
        // Monitor ViewTracker events
        const originalConsoleLog = console.log;
        console.log = function() {
            const args = Array.from(arguments);
            const message = args.join(' ');
            
            // Capture view tracking messages
            if (message.includes('View tracked:') || 
                message.includes('Loaded initial view counts') ||
                message.includes('Refreshed view counts')) {
                logMessage(message);
            }
            
            // Pass through to original console
            originalConsoleLog.apply(console, arguments);
        };
        
        // Monitor errors
        const originalConsoleError = console.error;
        console.error = function() {
            const args = Array.from(arguments);
            const message = args.join(' ');
            
            // Log view tracking errors
            if (message.includes('Error tracking view') || 
                message.includes('Error fetching view counts')) {
                logMessage(`❌ ${message}`);
            }
            
            // Pass through to original console
            originalConsoleError.apply(console, arguments);
        };
        
        // Monitor network requests for view tracking
        const originalFetch = window.fetch;
        window.fetch = function(...args) {
            const url = args[0];
            if (url && (url.includes('/api/views') || url.includes('views_count'))) {
                logMessage(`📡 API Call: ${url}`);
            }
            return originalFetch.apply(this, args);
        };
        
        // Check if ViewTracker is available
        setTimeout(() => {
            if (window.SimpleViewTracker) {
                logMessage('✅ SimpleViewTracker detected and initialized');
                logMessage(`📊 Current tracked content: ${window.SimpleViewTracker.trackedContent?.size || 0} items`);
            } else if (window.ViewTracker) {
                logMessage('✅ ViewTracker detected and initialized');
                logMessage(`📊 Current tracked content: ${window.ViewTracker.trackedContent?.size || 0} items`);
            } else {
                logMessage('⚠️ No ViewTracker detected');
            }
        }, 2000);
        
        // Periodic status check
        setInterval(() => {
            if (window.SimpleViewTracker) {
                const trackedCount = window.SimpleViewTracker.trackedContent?.size || 0;
                logMessage(`📈 Active tracking: ${trackedCount} items`);
            } else if (window.ViewTracker) {
                const trackedCount = window.ViewTracker.trackedContent?.size || 0;
                logMessage(`📈 Active tracking: ${trackedCount} items`);
            }
        }, 10000);
        
        logMessage('✅ Real-time monitoring active');
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMonitor);
    } else {
        initMonitor();
    }
    
})();