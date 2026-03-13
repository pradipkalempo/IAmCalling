# IAMCALLING - Ideology Analyzer and Critical Thinking Platform

A comprehensive web platform designed to foster critical thinking skills through interactive content, cognitive testing, real-time messaging, and community-driven content creation.

## 🎯 Project Overview

IAMCALLING is an educational social platform that combines:
- **Critical Thinking Development** - Interactive cognitive tests and challenges
- **Content Management System** - User-generated articles with admin moderation
- **Real-time Communication** - WebSocket-based messenger with audio/video call support
- **Ideology Analysis** - Photo-based political ideology analyzer
- **Community Engagement** - User profiles, rewards, and social interactions

## ✨ Core Features

### 🧠 Critical Thinking & Cognitive Testing
- Interactive cognitive testing with 8-question assessment
- Critical thinking scenarios with difficulty levels (easy, medium, hard)
- Analytical result evaluation with personalized feedback
- Political ideology analyzer with visual categorization

### 📝 Content Management
- User-generated article creation and publishing
- Admin dashboard for content moderation
- Real-time view tracking and analytics
- Category-based content organization
- Thumbnail support for posts and articles
- Rich text content with code execution capabilities

### 💬 Real-time Messaging System
- WebSocket-based instant messaging
- One-on-one conversations with read receipts
- Unread message counters and notifications
- User search and conversation management
- Last seen timestamps
- Audio/video call initiation (infrastructure ready)
- Message history with pagination

### 👤 User Management
- Secure authentication with bcrypt password hashing
- 4-digit PIN-based password system
- Email-based password reset with token verification
- User profiles with customizable photos
- Profile photo upload via Cloudinary
- User settings and preferences
- Public user profiles

### 🎁 Engagement Features
- Reward system for user participation
- View tracking for content analytics
- User activity monitoring
- Social interactions and following

### 🔐 Security & Performance
- Helmet.js for security headers
- Rate limiting on API endpoints (300 requests/15min)
- Row Level Security (RLS) on Supabase
- JWT-based authentication
- CORS configuration
- Response caching for optimized performance

## 🛠️ Tech Stack

### Frontend
- **HTML5, CSS3, JavaScript (Vanilla)**
- **EJS** - Server-side templating
- **Font Awesome** - Icons
- **Responsive Design** - Mobile-first approach

### Backend
- **Node.js** (v18+)
- **Express.js** (v5.2.1) - Web framework
- **WebSocket (ws)** - Real-time communication
- **Nodemailer** - Email notifications
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **Morgan** - HTTP request logging

### Database & Storage
- **Supabase** (PostgreSQL) - Primary database
- **Cloudinary** - Media storage and CDN
- **Supabase Realtime** - Real-time subscriptions

### Testing
- **Mocha** - Test framework
- **Chai** - Assertion library
- **Cypress** - E2E testing
- **Supertest** - API testing

### DevOps
- **Docker** - Containerization
- **PM2** - Process management
- **Nginx** - Reverse proxy
- **Render/Heroku** - Deployment platforms

## 📦 Installation

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- Supabase account
- Cloudinary account

### Clone Repository
```bash
git clone https://github.com/yourusername/iamcalling.git
cd Icu_updated.1
cd iamcalling
```

### Install Dependencies
```bash
npm install
```

## ⚙️ Configuration

### Environment Variables
Create `iamcalling/.env` file:

```env
# Server Configuration
PORT=10000
NODE_ENV=production
CORS_ORIGIN=http://localhost:10000

# Supabase Configuration
SUPABASE_URL=your-supabase-project-url
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_KEY=your-supabase-service-role-key

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email Configuration (for password reset)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password

# Admin Configuration
ADMIN_PASSWORD=your-secure-admin-password
```

### Database Setup

1. **Create Supabase Project** at [supabase.com](https://supabase.com)

2. **Run SQL Migrations** in Supabase SQL Editor:
```bash
# Execute in order:
iamcalling/supabase/schema.sql
iamcalling/supabase/users_schema.sql
iamcalling/supabase/policies.sql
iamcalling/supabase_migrations/*.sql
```

3. **Enable Realtime** for tables:
   - `messages`
   - `conversations`
   - `posts`

### Cloudinary Setup
1. Create account at [cloudinary.com](https://cloudinary.com)
2. Get API credentials from Dashboard
3. Add credentials to `.env` file

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Access Application
Open browser and navigate to:
```
http://localhost:10000
```

## 🧪 Testing

### Run All Tests
```bash
npm test
```

### Run Specific Test Suites
```bash
# Unit tests
npm run test:unit

# Messenger tests
npm run test:messenger

# E2E tests with Cypress
npx cypress open
```

## 📁 Project Structure

```
iamcalling/
├── public/              # Static frontend files
│   ├── css/            # Stylesheets
│   ├── js/             # Client-side JavaScript
│   ├── uploads/        # User uploaded files
│   └── *.html          # HTML pages
├── routes/             # Express route handlers
│   ├── auth.js         # Authentication routes
│   ├── posts.js        # Post management
│   ├── messenger.js    # Messaging system
│   ├── userProfile.js  # User profiles
│   └── ...
├── services/           # Business logic layer
│   ├── criticalThinkingService.js
│   ├── userProfileService.js
│   └── ...
├── supabase/           # Database schemas
├── supabase_migrations/ # Database migrations
├── tests/              # Test suites
├── views/              # EJS templates
├── server.js           # Main application entry
└── package.json        # Dependencies
```

## 🔑 Key Pages

- `/` - Home page with latest posts
- `/15-login.html` - User login
- `/16-register.html` - User registration
- `/18-profile.html` - User profile
- `/09-cognitive-testing.html` - Cognitive test
- `/10-critical-thinking-challenge.html` - Critical thinking challenges
- `/22-write_article.html` - Article creation
- `/34-icalluser-messenger.html` - Real-time messenger
- `/39-admin-login.html` - Admin login
- `/40-admin-dashboard-simple.html` - Admin dashboard

## 🔒 Security Features

- **Password Hashing** - bcrypt with salt rounds
- **JWT Authentication** - Secure token-based auth
- **Rate Limiting** - API endpoint protection
- **Helmet.js** - Security headers
- **CORS** - Cross-origin resource sharing control
- **RLS** - Row-level security on database
- **Input Validation** - Server-side validation
- **XSS Protection** - Content security policies

## 📊 Database Schema

### Main Tables
- `users` - User accounts and profiles
- `posts` - Published articles and content
- `messages` - Chat messages
- `conversations` - User conversations
- `calls` - Audio/video call records
- `ideology_photos` - Political ideology images
- `game_results` - Cognitive test results

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/password-reset/request` - Request password reset
- `POST /api/password-reset/reset-password` - Reset password

### Posts
- `GET /api/posts` - Get all posts (paginated)
- `GET /api/posts/:id` - Get single post
- `POST /api/posts` - Create new post

### Messenger
- `GET /api/messenger/conversations` - Get user conversations
- `GET /api/messenger/conversations/:id/messages` - Get messages
- `POST /api/messenger/conversations/:id/messages` - Send message
- `POST /api/messenger/conversations` - Create conversation

### Profile
- `GET /api/profile/:userId` - Get user profile
- `PUT /api/profile/:userId` - Update profile
- `POST /api/upload` - Upload profile photo

## 🚢 Deployment

### Using Docker
```bash
docker build -t iamcalling .
docker run -p 10000:10000 --env-file .env iamcalling
```

### Using PM2
```bash
pm2 start ecosystem.config.js
```

### Deploy to Render
1. Connect GitHub repository
2. Set environment variables
3. Deploy from `main` branch

See `DEPLOYMENT_GUIDE.md` for detailed instructions.

## 📝 Documentation

- `DEPLOYMENT_GUIDE.md` - Deployment instructions
- `QUICK_START.md` - Quick start guide
- `MESSENGER_TEST_GUIDE.md` - Messenger testing
- `PASSWORD_RESET_SETUP.md` - Password reset configuration
- `CLOUDINARY_SETUP.md` - Cloudinary integration

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 🐛 Known Issues

- WebRTC video calling UI needs enhancement
- Mobile responsive design improvements needed for some pages
- Performance optimization needed for large message histories

## 🔮 Future Enhancements

- [ ] WebRTC video/audio calling implementation
- [ ] Push notifications for mobile
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Dark mode theme
- [ ] Progressive Web App (PWA) features
- [ ] AI-powered content recommendations

## 👨‍💻 Author

**Pradip Kale** - Data Engineer  
- LinkedIn: [pradip-kale-a116112a0](https://www.linkedin.com/in/pradip-kale-a116112a0)
- Email: Contact via LinkedIn

## 📄 License

PK Venture's © 2025. All rights reserved.

## 🙏 Acknowledgments

- Supabase for backend infrastructure
- Cloudinary for media management
- Font Awesome for icons
- Open source community

---

**Note**: This is a BCA Final Year Project demonstrating full-stack web development with real-time features, secure authentication, and modern web technologies.
