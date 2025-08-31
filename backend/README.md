# RMGen Backend

Python Flask backend for the RMGen smart README generator application.

## Setup

1. **Install Python dependencies:**

   ```bash
   pip install -r requirements.txt
   ```

2. **Configure environment variables:**

   ```bash
   cp env.example .env
   # Edit .env with your actual API keys and configuration
   ```

3. **Required API Keys:**

   - **Gemini API Key**: Get from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - **GitHub Token**: Optional, for higher API rate limits
   - **GitHub OAuth**: For "Connect GitHub" functionality

4. **Run the application:**
   ```bash
   python app.py
   ```

## API Endpoints

- `POST /api/validate-repo` - Validate GitHub repository and fetch metadata
- `POST /api/generate-readme` - Generate README content using Gemini AI
- `GET /api/github-oauth-url` - Get GitHub OAuth URL
- `GET /api/github-repos` - Get user's repositories (requires OAuth)
- `GET /api/health` - Health check

## Environment Variables

- `GEMINI_API_KEY`: Your Google Gemini API key
- `GITHUB_TOKEN`: GitHub personal access token (optional)
- `GITHUB_CLIENT_ID`: GitHub OAuth app client ID
- `GITHUB_CLIENT_SECRET`: GitHub OAuth app client secret
- `GITHUB_REDIRECT_URI`: OAuth callback URL
- `PORT`: Flask server port (default: 5000)

## Development

The backend handles:

- GitHub repository validation and metadata fetching
- AI-powered README generation via Gemini
- OAuth authentication flow
- Repository content analysis and project type detection
