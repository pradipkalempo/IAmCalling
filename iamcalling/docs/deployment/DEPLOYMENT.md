# IAMCALLING Deployment Guide (Render)

## Recommended Entry Point
- Server: `iamcalling/server.js`
- Home page: `iamcalling/public/01-index.html`

## Local Development
1. Install dependencies:
   ```bash
   npm install --prefix iamcalling
   ```
2. Configure env:
   - Copy `iamcalling/.env.example` to `iamcalling/.env`
   - Fill in all values
3. Start server:
   ```bash
   npm --prefix iamcalling start
   ```
4. Open: `http://localhost:1000`

## Render Deployment
1. Push repo to GitHub.
2. Create a **Web Service** in Render.
3. Use these settings:
   - Root Directory: `iamcalling`
   - Build Command: `npm install`
   - Start Command: `npm start`
4. Add environment variables in Render:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_KEY`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `ADMIN_PASSWORD`
   - `ADMIN_EMAIL`
   - `EMAIL_USER`
   - `EMAIL_PASS`
   - `JWT_SECRET`
   - `CORS_ORIGIN` (optional, comma-separated)

## Notes
- `config.js` is served from the server and injects public Supabase config into the frontend at runtime.
- Do not commit real secrets to the repo.