# RMGen Frontend

This directory contains the React and TypeScript frontend for RMGen, a smart README generator. It provides a modern, step-by-step user interface to guide users through the process of creating a high-quality README for their software projects.

## Features

-   **Step-by-Step Wizard**: A guided workflow from connecting a repository to generating the final file.
-   **GitHub Integration**: Connect via URL for public repositories or use GitHub OAuth to select from your own public and private repositories.
-   **Smart Section Selection**: Choose which sections to include in your README, with smart defaults suggested based on repository contents.
-   **AI-Powered Content**: Leverages the Gemini API via the backend to generate content for each section.
-   **Live Preview & Refinement**: A real-time Markdown preview that allows you to edit and refine the AI-generated content before downloading.
-   **Responsive Design**: A clean, mobile-first interface built with Tailwind CSS.

## Tech Stack

-   **React 18** with TypeScript
-   **Tailwind CSS** for styling
-   **React Router** for navigation
-   **Lucide React** for icons
-   **Markdown-it** for Markdown rendering

## Getting Started

The included `setup.sh` script in the root directory can be used to set up the entire project, including the frontend. For a manual setup, follow these steps:

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Configure Environment Variables:**
    Create a `.env` file by copying `env.example`.
    ```bash
    cp env.example .env
    ```
    Edit `.env` to point `REACT_APP_API_URL` to your running backend instance (e.g., `http://localhost:5001/api`).

3.  **Start the Development Server:**
    ```bash
    npm start
    ```
    The application will be available at `http://localhost:3000`.

## Available Scripts

-   `npm start`: Runs the app in development mode.
-   `npm run build`: Builds the app for production.
-   `npm test`: Launches the test runner.

## Deployment

To deploy the application, run `npm run build` and serve the contents of the `build` directory. Ensure you have set the `REACT_APP_API_URL` environment variable in your deployment environment to point to the live backend API.