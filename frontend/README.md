# RMGen Frontend

React TypeScript frontend for the RMGen smart README generator application.

## Features

- **Modern UI/UX**: Built with React 18, TypeScript, and Tailwind CSS
- **Responsive Design**: Mobile-first responsive design that works on all devices
- **Guided Workflow**: Step-by-step README generation process
- **Live Preview**: Real-time Markdown rendering and editing
- **GitHub Integration**: Connect repositories and fetch metadata
- **AI-Powered**: Integration with Google Gemini for content generation

## Tech Stack

- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Lucide React** for icons
- **Markdown-it** for Markdown rendering
- **Custom hooks** for state management

## Getting Started

### Prerequisites

- Node.js 16+ and npm/yarn
- Backend API running (see backend README)

### Installation

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Configure environment variables:**

   ```bash
   # Create .env file
   cp .env.example .env

   # Edit .env with your backend API URL
   REACT_APP_API_URL=http://localhost:5000/api
   ```

3. **Start the development server:**

   ```bash
   npm start
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── components/          # React components
│   ├── Header.tsx      # Application header
│   ├── LandingPage.tsx # Repository input options
│   ├── SetupQuestions.tsx # Project setup questions
│   ├── SectionSelection.tsx # README section selection
│   ├── ContentInput.tsx # Content input forms
│   └── Preview.tsx     # README preview and editing
├── services/           # API services
│   └── api.ts         # Backend API integration
├── types/              # TypeScript type definitions
│   └── types.ts       # Application interfaces
├── App.tsx            # Main application component
├── index.tsx          # Application entry point
└── index.css          # Global styles and Tailwind
```

## Component Overview

### LandingPage

- Repository input methods (URL, owner/repo, OAuth, skip)
- GitHub repository validation
- Auto-detection of project metadata

### SetupQuestions

- Project type selection (Template, Web App, Downloadable App)
- Team context (Solo vs Team)
- Auto-detection based on repository contents

### SectionSelection

- Choose README sections to include
- Required vs optional sections
- Smart defaults based on repository data

### ContentInput

- Guided content input for each section
- Progress tracking through sections
- Integration with existing README content

### Preview

- AI-generated README content
- Live Markdown preview
- Edit and download functionality

## Development

### Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

### Code Style

- TypeScript strict mode enabled
- ESLint configuration for code quality
- Prettier for code formatting
- Component-based architecture
- Custom hooks for reusable logic

### State Management

- React useState for local component state
- Props drilling for app-wide state
- Context API ready for future expansion

## Deployment

### Build for Production

```bash
npm run build
```

The build output will be in the `build/` directory.

### Deploy to Netlify/Vercel

1. Connect your repository to Netlify or Vercel
2. Set build command: `npm run build`
3. Set publish directory: `build`
4. Configure environment variables

### Environment Variables

- `REACT_APP_API_URL`: Backend API base URL
- `REACT_APP_GITHUB_CLIENT_ID`: GitHub OAuth client ID (optional)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Troubleshooting

### Common Issues

- **API Connection**: Ensure backend is running and accessible
- **GitHub OAuth**: Check OAuth configuration in backend
- **Build Errors**: Verify Node.js version and dependencies
- **Styling Issues**: Check Tailwind CSS configuration

### Getting Help

- Check the backend logs for API errors
- Verify environment variables are set correctly
- Ensure all dependencies are installed
- Check browser console for JavaScript errors
