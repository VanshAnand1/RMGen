# RMGen Backend

This directory contains the Python Flask backend for the RMGen application. It serves as the engine that connects to the GitHub API, fetches repository data, and uses the Google Gemini API to intelligently generate README.md files.

## Core Functions

- **GitHub Integration**: Validates public repositories, fetches metadata, and analyzes content to auto-detect project details.
- **GitHub OAuth**: Allows users to securely connect their GitHub account to access and select from their private and public repositories.
- **AI-Powered Generation**: Takes project context, user-selected sections, and custom input to generate well-structured README files.
- **Refinement**: Allows users to refine and edit the generated content with further prompts.

## Getting Started

The included `setup.sh` script in the root directory can be used to set up the entire project, including the backend. For a manual setup, follow these steps:

1.  **Create a Virtual Environment:**
    ```bash
    python3 -m venv venv
    source venv/bin/activate
    ```

2.  **Install Dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

3.  **Configure Environment Variables:**
    Create a `.env` file by copying the `env.example`.
    ```bash
    cp env.example .env
    ```
    Then, fill in the required API keys and secrets in the `.env` file.

4.  **Run the Server:**
    ```bash
    python app.py
    ```
    The backend will be running at `http://localhost:5001`.

## API Endpoints

-   `POST /api/validate-repo`: Validates a GitHub repository URL and fetches its metadata.
-   `POST /api/generate-readme`: Generates a new README based on user selections and project context.
-   `POST /api/refine-readme`: Refines existing README content based on a user's prompt.
-   `GET /api/github-oauth-url`: Provides the URL to initiate the GitHub OAuth flow.
-   `POST /api/github-callback`: Handles the callback from GitHub to exchange a code for an access token.
-   `GET /api/github-repos`: Fetches the authenticated user's repositories.
-   `GET /api/health`: A simple health check endpoint.

## Environment Variables

-   `GEMINI_API_KEY`: Your Google Gemini API key.
-   `GITHUB_TOKEN`: A GitHub personal access token (optional, for higher API rate limits).
-   `GITHUB_CLIENT_ID`: The Client ID of your GitHub OAuth App.
-   `GITHUB_CLIENT_SECRET`: The Client Secret of your GitHub OAuth App.
-   `GITHUB_REDIRECT_URI`: The OAuth callback/redirect URI.
-   `FRONTEND_ORIGINS`: A comma-separated list of allowed frontend origins for CORS (e.g., `http://localhost:3000`).
-   `PORT`: The port for the Flask server (defaults to `5001`).