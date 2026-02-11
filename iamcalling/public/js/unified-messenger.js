<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>IAMCALLING - Real-time Messenger</title>
    <link rel="stylesheet" href="messenger-realtime.css">
    <link rel="stylesheet" href="realtime-messenger.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <meta name="theme-color" content="#00a884">
</head>
<body>
    <div id="app" class="messenger-container">
        <!-- Sidebar -->
        <aside id="sidebar" class="conversations-sidebar">
            <header class="conversations-header">
                <div class="header-content">
                    <h3><i class="fas fa-comments"></i> Messages</h3>
                    <button id="refreshBtn" class="refresh-btn" aria-label="Refresh conversations">
                        <i class="fas fa-sync-alt"></i>
                    </button>
                </div>
                <div class="search-container">
                    <input 
                        type="text" 
                        id="searchInput" 
                        class="search-input" 
                        placeholder="Search conversations..."
                        aria-label="Search conversations"
                    >
                    <i class="fas fa-search search-icon"></i>
                </div>
            </header>
            
            <main id="conversationsList" class="conversation-list" role="list">
                <div class="loading-spinner">
                    <div class="spinner" aria-label="Loading conversations"></div>
                </div>
            </main>
        </aside>

        <!-- Chat Area -->
        <section id="main-content" class="chat-area">
            <!-- Welcome Screen -->
            <div id="welcomeScreen" class="welcome-screen">
                <div class="welcome-content">
                    <i class="fas fa-comments welcome-icon"></i>
                    <h2>Welcome to IAMCALLING Messenger</h2>
                    <p>Select a conversation to start messaging</p>
                </div>
            </div>

            <!-- Chat Header (Hidden by default) -->
            <header id="chatHeader" class="chat-header" style="display: none;">
                <button class="back-btn" aria-label="Back to conversations">
                    <i class="fas fa-arrow-left"></i>
                </button>
                <div class="user-avatar">
                    <img id="chatUserAvatar" src="" alt="" aria-hidden="true">
                    <div id="chatUserStatus" class="online-status"></div>
                </div>
                <div class="chat-user-info">
                    <h4 id="chatUserName"></h4>
                    <span id="chatUserStatusText" class="chat-user-status"></span>
                </div>
                <div class="chat-header-actions">
                    <button class="action-btn" aria-label="More options">
                        <i class="fas fa-ellipsis-v"></i>
                    </button>
                </div>
            </header>

            <!-- Messages Container -->
            <div id="chat-messages" class="messages-container" role="log" aria-live="polite">
                <!-- Messages will be loaded here -->
            </div>

            <!-- Message Input -->
            <footer id="messageInputArea" class="message-input-area" style="display: none;">
                <button class="attach-btn" aria-label="Attach file">
                    <i class="fas fa-paperclip"></i>
                </button>
                <div class="input-container">
                    <textarea 
                        id="chat-input" 
                        class="message-input" 
                        placeholder="Type a message..."
                        rows="1"
                        aria-label="Type a message"
                        disabled
                    ></textarea>
                    <button class="emoji-btn" aria-label="Add emoji">
                        <i class="fas fa-smile"></i>
                    </button>
                </div>
                <button id="send-btn" class="send-button" disabled aria-label="Send message">
                    <i class="fas fa-paper-plane"></i>
                </button>
            </footer>
        </section>
    </div>

    <!-- Notification Container -->
    <div id="notificationContainer" class="notification-container"></div>

    <!-- Configuration -->
    <script>
        window.APP_CONFIG = {
            supabaseUrl: 'https://zqypdwdqfehxrxgvhebw.supabase.co',
            supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxeXBkd2RxZmVoeHJ4Z3ZoZWJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQxMDA0NjIsImV4cCI6MjA0OTY3NjQ2Mn0.V5ANrP_3n_iqg7hbC2A3A0E3qK5t6s7c8d9e0f1g2h'
        };
    </script>

    <!-- Main Application Script -->
    <script src="unified-messenger.js"></script>
</body>
</html>