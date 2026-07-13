# IAMCALLING - Ideology Analyzer and Critical Thinking Platform

A comprehensive web platform designed to foster critical thinking skills through interactive content, cognitive testing, real-time messaging, and community-driven content creation.

## 📁 Project Structure (Standardized)

```
iamcalling/
├── src/                           # Source code
│   ├── client/                    # Frontend code
│   │   ├── assets/               # Static assets
│   │   │   ├── css/              # Stylesheets
│   │   │   └── js/               # Client-side JavaScript
│   │   └── pages/                # HTML pages & EJS templates
│   ├── server/                   # Backend code
│   │   ├── controllers/          # Route handlers (formerly routes/)
│   │   ├── services/             # Business logic
│   │   └── app.js                # Express app setup
│   └── shared/                   # Shared utilities
├── database/                     # Database related files
│   ├── migrations/               # Database migrations
│   └── schemas/                  # Database schemas
├── tests_new/                    # Organized test suites
│   ├── unit/                     # Unit tests
│   ├── integration/              # Integration tests
│   └── e2e/                      # End-to-end tests
├── docs/                         # Documentation
├── config/                       # Configuration files
├── scripts/                      # Build/deployment scripts
├── server.js                     # Main entry point
├── package.json                  # Dependencies
└── README.md                     # This file
```

## 🚀 Quick Start

### Installation
```bash
# Clone and navigate
git clone <repository-url>
cd iamcalling

# Install dependencies
npm install

# Setup environment
cp config/.env.example .env
# Edit .env with your configuration

# Start development server
npm run dev
```

### Environment Setup
Create `.env` file in root directory:
```env
PORT=10000
NODE_ENV=development
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-key
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## 🛠️ Development

### Available Scripts
- `npm start` - Production server
- `npm run dev` - Development with nodemon
- `npm test` - Run all tests
- `npm run test:unit` - Unit tests only
- `npm run test:e2e` - End-to-end tests
- `npm run lint` - Code linting
- `npm run format` - Code formatting

### File Organization
- **Controllers** (`src/server/controllers/`) - Handle HTTP requests
- **Services** (`src/server/services/`) - Business logic
- **Assets** (`src/client/assets/`) - CSS, JS, images
- **Pages** (`src/client/pages/`) - HTML templates
- **Database** (`database/`) - Schemas and migrations
- **Tests** (`tests_new/`) - Organized test suites

## 🔧 Migration from Old Structure

The project has been restructured for better maintainability:

### Key Changes:
1. **Separated frontend/backend** - Clear distinction between client and server code
2. **Standardized naming** - Controllers instead of routes, organized assets
3. **Centralized configuration** - All config in dedicated directory
4. **Organized tests** - Structured test suites by type
5. **Documentation** - Consolidated in docs/ directory

### Path Updates:
- `public/` → `src/client/assets/` and `src/client/pages/`
- `routes/` → `src/server/controllers/`
- `views/` → `src/client/pages/`
- Documentation → `docs/`

## 📚 Documentation

See `docs/` directory for detailed documentation:
- `docs/DEPLOYMENT_GUIDE.md` - Deployment instructions
- `docs/QUICK_START.md` - Getting started guide
- `docs/API_REFERENCE.md` - API documentation

## 🧪 Testing

### Test Structure:
- **Unit Tests** - Individual component testing
- **Integration Tests** - API and service integration
- **E2E Tests** - Full user workflow testing

### Running Tests:
```bash
# All tests
npm test

# Specific test types
npm run test:unit
npm run test:integration
npm run test:e2e:open
```

## 🚢 Deployment

### Production Build:
```bash
npm run build
npm start
```

### Docker:
```bash
docker build -t iamcalling .
docker run -p 10000:10000 iamcalling
```

## 🤝 Contributing

1. Follow the established directory structure
2. Place files in appropriate directories
3. Update tests for new features
4. Follow naming conventions
5. Update documentation

## 📄 License

PK Venture's © 2025. All rights reserved.

---

**Note**: This restructured version maintains all original functionality while providing better organization and maintainability.