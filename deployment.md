# RMGen Deployment Guide

This guide covers deploying the RMGen application to various cloud platforms.

## Prerequisites

- Git repository with your RMGen code
- API keys configured (Gemini, GitHub)
- Domain name (optional but recommended)

## Backend Deployment

### Option 1: Render (Recommended for Free Tier)

1. **Create Render Account**

   - Sign up at [render.com](https://render.com)
   - Connect your GitHub repository

2. **Create Web Service**

   - Click "New +" → "Web Service"
   - Connect your repository
   - Set build command: `pip install -r requirements.txt`
   - Set start command: `gunicorn app:app`
   - Set environment variables:
     ```
     GEMINI_API_KEY=your_key_here
     GITHUB_TOKEN=your_token_here
     GITHUB_CLIENT_ID=your_client_id
     GITHUB_CLIENT_SECRET=your_client_secret
     GITHUB_REDIRECT_URI=https://your-app.onrender.com/auth/callback
     ```

3. **Deploy**
   - Click "Create Web Service"
   - Wait for build and deployment

### Option 2: Fly.io

1. **Install Fly CLI**

   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Create App**

   ```bash
   fly launch
   ```

3. **Configure Environment**

   ```bash
   fly secrets set GEMINI_API_KEY=your_key_here
   fly secrets set GITHUB_TOKEN=your_token_here
   ```

4. **Deploy**
   ```bash
   fly deploy
   ```

### Option 3: Heroku

1. **Install Heroku CLI**

   ```bash
   # macOS
   brew install heroku/brew/heroku

   # Windows
   # Download from https://devcenter.heroku.com/articles/heroku-cli
   ```

2. **Create App**

   ```bash
   heroku create your-rmgen-app
   ```

3. **Set Environment Variables**

   ```bash
   heroku config:set GEMINI_API_KEY=your_key_here
   heroku config:set GITHUB_TOKEN=your_token_here
   ```

4. **Deploy**
   ```bash
   git push heroku main
   ```

## Frontend Deployment

### Option 1: Netlify (Recommended)

1. **Create Netlify Account**

   - Sign up at [netlify.com](https://netlify.com)
   - Connect your GitHub repository

2. **Configure Build Settings**

   - Build command: `npm run build`
   - Publish directory: `build`
   - Set environment variables:
     ```
     REACT_APP_API_URL=https://your-backend-url.com/api
     ```

3. **Deploy**
   - Netlify will automatically deploy on push to main branch

### Option 2: Vercel

1. **Create Vercel Account**

   - Sign up at [vercel.com](https://vercel.com)
   - Import your GitHub repository

2. **Configure Build**

   - Framework preset: Create React App
   - Build command: `npm run build`
   - Output directory: `build`
   - Set environment variables in Vercel dashboard

3. **Deploy**
   - Vercel will automatically deploy on push

### Option 3: GitHub Pages

1. **Install gh-pages**

   ```bash
   npm install --save-dev gh-pages
   ```

2. **Update package.json**

   ```json
   {
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d build"
     },
     "homepage": "https://username.github.io/repository-name"
   }
   ```

3. **Deploy**
   ```bash
   npm run deploy
   ```

## Environment Configuration

### Backend Environment Variables

```bash
# Required
GEMINI_API_KEY=your_gemini_api_key

# Optional but recommended
GITHUB_TOKEN=your_github_token
GITHUB_CLIENT_ID=your_oauth_client_id
GITHUB_CLIENT_SECRET=your_oauth_client_secret
GITHUB_REDIRECT_URI=https://your-domain.com/auth/callback

# Flask configuration
FLASK_ENV=production
PORT=5000
```

### Frontend Environment Variables

```bash
# Required
REACT_APP_API_URL=https://your-backend-url.com/api

# Optional
REACT_APP_GITHUB_CLIENT_ID=your_github_oauth_client_id
```

## Domain Configuration

### Custom Domain Setup

1. **Purchase Domain**

   - Use providers like Namecheap, GoDaddy, or Google Domains

2. **Configure DNS**

   - Point to your hosting provider's nameservers
   - Add CNAME records for subdomains

3. **SSL Certificate**
   - Most platforms provide automatic SSL
   - For custom setups, use Let's Encrypt

### Subdomain Structure

```
rmgen.yourdomain.com     # Frontend
api.rmgen.yourdomain.com # Backend
```

## Monitoring and Maintenance

### Health Checks

- Backend: `GET /api/health`
- Frontend: Built-in React error boundaries

### Logs

- Render: Built-in logging
- Fly.io: `fly logs`
- Heroku: `heroku logs --tail`
- Netlify: Built-in logging
- Vercel: Built-in logging

### Performance

- Enable gzip compression
- Use CDN for static assets
- Implement caching headers
- Monitor API response times

## Troubleshooting

### Common Issues

1. **CORS Errors**

   - Ensure backend CORS is configured for your frontend domain
   - Check environment variables are set correctly

2. **API Connection Failures**

   - Verify backend URL in frontend environment
   - Check backend is running and accessible
   - Test API endpoints directly

3. **Build Failures**

   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check for TypeScript compilation errors

4. **Environment Variables**
   - Ensure variables are set in hosting platform
   - Check variable names match exactly
   - Restart services after changing variables

### Debug Mode

For local debugging, you can enable debug mode:

```bash
# Backend
export FLASK_ENV=development
export FLASK_DEBUG=1

# Frontend
export REACT_APP_DEBUG=true
```

## Security Considerations

1. **API Keys**

   - Never commit API keys to version control
   - Use environment variables for all secrets
   - Rotate keys regularly

2. **CORS Configuration**

   - Restrict CORS to your frontend domain only
   - Avoid using `*` in production

3. **Rate Limiting**

   - Implement rate limiting on backend APIs
   - Use GitHub API tokens to avoid rate limits

4. **HTTPS**
   - Always use HTTPS in production
   - Redirect HTTP to HTTPS

## Cost Optimization

### Free Tier Options

- **Render**: Free tier with sleep after inactivity
- **Fly.io**: Generous free tier
- **Netlify**: Free tier for personal projects
- **Vercel**: Free tier for hobby projects

### Paid Tier Considerations

- **Render**: $7/month for always-on service
- **Fly.io**: Pay-as-you-use pricing
- **Heroku**: $7/month for basic dyno

## Support

For deployment issues:

1. Check platform-specific documentation
2. Review error logs
3. Test locally first
4. Check environment variable configuration
5. Verify API endpoints are accessible
