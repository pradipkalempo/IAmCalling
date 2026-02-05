// Notification Center for IAMCALLING
class NotificationCenter {
    constructor() {
        this.notifications = [];
        this.unreadCount = 0;
        this.init();
    }

    init() {
        this.loadNotifications();
        this.createNotificationUI();
        this.bindEvents();
    }

    loadNotifications() {
        try {
            this.notifications = JSON.parse(localStorage.getItem('global_notifications') || '[]');
            this.updateUnreadCount();
        } catch (error) {
            console.error('Error loading notifications:', error);
            this.notifications = [];
        }
    }

    updateUnreadCount() {
        this.unreadCount = this.notifications.filter(n => !n.read).length;
        this.updateBadge();
    }

    createNotificationUI() {
        // Check if user is logged in
        const userData = localStorage.getItem('userData');
        const authToken = localStorage.getItem('userToken') || localStorage.getItem('authToken');
        
        if (!userData || !authToken) {
            return; // Don't show anything if user is not logged in
        }
        
        // Add profile photo to header if it doesn't exist
        const header = document.querySelector('header nav ul');
        if (header && !document.getElementById('notification-bell')) {
            let userName = 'User';
            let isAdmin = false;
            
            try {
                const userInfo = JSON.parse(userData);
                userName = userInfo?.full_name || userInfo?.first_name || userInfo?.name || 'User';
                isAdmin = (userInfo.id === 'admin' && userInfo.role === 'admin') || (userInfo.email === 'admin@iamcalling.com');
            } catch (e) {
                userName = 'User';
            }
            
            const profileUrl = isAdmin ? 'admin-profiles.html' : '18-profile.html';
            const seed = (userName || 'user').toString().replace(/[^a-zA-Z0-9]/g, '') || 'user';
            const photoUrl = `https://i.pravatar.cc/150?u=${seed}`;
            
            const notificationLi = document.createElement('li');
            notificationLi.innerHTML = `
                <a href="${profileUrl}" id="notification-bell" style="position: relative; display: flex; align-items: center;">
                    <img src="${photoUrl}" alt="Profile" style="width: 35px; height: 35px; border-radius: 50%; border: 2px solid #d4af37; cursor: pointer;">
                    <span id="notification-badge" class="notification-badge" style="display: none; position: absolute; top: -5px; right: -5px; background: #e53935; color: white; border-radius: 50%; width: 20px; height: 20px; font-size: 12px; display: flex; align-items: center; justify-content: center;">0</span>
                </a>
            `;
            
            // Insert before login/logout
            const loginLink = header.querySelector('.login-link');
            if (loginLink && loginLink.parentElement) {
                header.insertBefore(notificationLi, loginLink.parentElement);
            } else {
                header.appendChild(notificationLi);
            }
        }

        // Create notification dropdown
        if (!document.getElementById('notification-dropdown')) {
            const dropdown = document.createElement('div');
            dropdown.id = 'notification-dropdown';
            dropdown.className = 'notification-dropdown';
            dropdown.innerHTML = `
                <div class="notification-header">
                    <h3>Notifications</h3>
                    <button id="mark-all-read">Mark all read</button>
                </div>
                <div class="notification-list" id="notification-list">
                    <!-- Notifications will be loaded here -->
                </div>
            `;
            document.body.appendChild(dropdown);
        }
    }

    updateBadge() {
        const badge = document.getElementById('notification-badge');
        if (badge) {
            if (this.unreadCount > 0) {
                badge.textContent = this.unreadCount > 99 ? '99+' : this.unreadCount;
                badge.style.display = 'inline-block';
            } else {
                badge.style.display = 'none';
            }
        }
    }

    bindEvents() {
        // Profile photo click handler - let it navigate to profile page
        const profileLink = document.getElementById('notification-bell');
        if (profileLink) {
            // Remove the click prevention to allow navigation to profile
            // The profile photo will now navigate to the user's profile page
        }

        // Mark all read handler
        const markAllRead = document.getElementById('mark-all-read');
        if (markAllRead) {
            markAllRead.addEventListener('click', () => {
                this.markAllAsRead();
            });
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            const dropdown = document.getElementById('notification-dropdown');
            const bell = document.getElementById('notification-bell');
            
            if (dropdown && !dropdown.contains(e.target) && !bell.contains(e.target)) {
                dropdown.classList.remove('show');
            }
        });

        // Listen for new notifications
        window.addEventListener('newArticlePublished', (event) => {
            this.addNotification(event.detail);
        });
    }

    toggleDropdown() {
        const dropdown = document.getElementById('notification-dropdown');
        if (dropdown) {
            dropdown.classList.toggle('show');
            if (dropdown.classList.contains('show')) {
                this.renderNotifications();
            }
        }
    }

    renderNotifications() {
        const list = document.getElementById('notification-list');
        if (!list) return;

        if (this.notifications.length === 0) {
            list.innerHTML = '<div class="no-notifications">No notifications yet</div>';
            return;
        }

        list.innerHTML = this.notifications.map(notification => `
            <div class="notification-item ${notification.read ? 'read' : 'unread'}" data-id="${notification.id}">
                <div class="notification-icon">
                    ${this.getNotificationIcon(notification.type)}
                </div>
                <div class="notification-content">
                    <div class="notification-title">${notification.title}</div>
                    <div class="notification-message">${notification.message}</div>
                    <div class="notification-time">${this.formatTime(notification.timestamp)}</div>
                </div>
                ${!notification.read ? '<div class="unread-dot"></div>' : ''}
            </div>
        `).join('');

        // Add click handlers for notifications
        list.querySelectorAll('.notification-item').forEach(item => {
            item.addEventListener('click', () => {
                const id = parseInt(item.dataset.id);
                this.markAsRead(id);
                
                // Navigate to article if it's an article notification
                const notification = this.notifications.find(n => n.id === id);
                if (notification && notification.type === 'new_article') {
                    window.location.href = '01-response-index.html';
                }
            });
        });
    }

    getNotificationIcon(type) {
        switch (type) {
            case 'new_article':
                return '<i class="fas fa-newspaper"></i>';
            case 'new_message':
                return '<i class="fas fa-envelope"></i>';
            case 'new_call':
                return '<i class="fas fa-phone"></i>';
            default:
                return '<i class="fas fa-bell"></i>';
        }
    }

    formatTime(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diff = now - time;
        
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        
        return time.toLocaleDateString();
    }

    addNotification(notification) {
        this.notifications.unshift(notification);
        
        // Keep only last 50 notifications
        if (this.notifications.length > 50) {
            this.notifications = this.notifications.slice(0, 50);
        }
        
        this.saveNotifications();
        this.updateUnreadCount();
    }

    markAsRead(id) {
        const notification = this.notifications.find(n => n.id === id);
        if (notification && !notification.read) {
            notification.read = true;
            this.saveNotifications();
            this.updateUnreadCount();
            this.renderNotifications();
        }
    }

    markAllAsRead() {
        this.notifications.forEach(n => n.read = true);
        this.saveNotifications();
        this.updateUnreadCount();
        this.renderNotifications();
    }

    saveNotifications() {
        localStorage.setItem('global_notifications', JSON.stringify(this.notifications));
    }
}

// Initialize notification center
const notificationCenter = new NotificationCenter();

// Export for global use
window.notificationCenter = notificationCenter;