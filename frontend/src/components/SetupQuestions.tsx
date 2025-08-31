import React, { useState } from "react";
import { AppState } from "../types";
import {
  ArrowLeft,
  ArrowRight,
  Code,
  Globe,
  Download,
  Users,
  User,
} from "lucide-react";

interface SetupQuestionsProps {
  appState: AppState;
  updateAppState: (updates: Partial<AppState>) => void;
  goToStep: (step: 'landing' | 'setup' | 'sections' | 'content' | 'preview') => void;
}

const SetupQuestions: React.FC<SetupQuestionsProps> = ({
  appState,
  updateAppState,
  goToStep,
}) => {
  const getInitialProjectType = () => {
    const detected = appState.repositoryMetadata?.detected_project_type;
    if (detected) {
      if (detected === 'Web Application') return 'Web Application';
      if (detected === 'Template') return 'Template';
      // For Python, Java, Rust, Go, Containerized, Generic, etc.
      return 'Downloadable Application';
    }
    return appState.projectType; // Fallback to the existing state
  };

  const [projectType, setProjectType] = useState(getInitialProjectType());
  const [teamContext, setTeamContext] = useState(
    appState.repositoryMetadata?.detected_team_context || appState.teamContext
  );
  const [projectName, setProjectName] = useState(appState.repositoryMetadata?.name || '');
  const [projectDescription, setProjectDescription] = useState(appState.repositoryMetadata?.description || '');


  const projectTypes = [
    {
      id: "Template",
      title: "Template",
      description: "A reusable template or boilerplate project",
      icon: Code,
      examples: "Starter templates, boilerplates, scaffolding tools",
    },
    {
      id: "Web Application",
      title: "Web Application",
      description: "A web-based application or service",
      icon: Globe,
      examples: "React apps, Node.js services, Django applications",
    },
    {
      id: "Downloadable Application",
      title: "Downloadable Application",
      description: "A desktop or mobile application",
      icon: Download,
      examples: "Desktop apps, mobile apps, CLI tools",
    },
  ];

  const teamContexts = [
    {
      id: "Solo",
      title: "Solo Project",
      description: "I worked on this project by myself",
      icon: User,
      examples: "Personal projects, learning experiments, solo contributions",
    },
    {
      id: "Team",
      title: "Team Project",
      description: "We worked on this project as a team",
      icon: Users,
      examples: "Open source projects, company projects, collaborative work",
    },
  ];

  const handleContinue = () => {
    updateAppState({
      projectType,
      teamContext,
      repositoryMetadata: {
        ...appState.repositoryMetadata!,
        name: projectName,
        description: projectDescription,
      },
    });
    goToStep("sections");
  };

  const canContinue = projectType && teamContext;

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="text-center mb-12">
        <h1 className="section-title text-4xl mb-4">Project Setup</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Help us understand your project better to generate the most
          appropriate README content.
        </p>
      </div>

      {/* Project Details */}
      <div className="card mb-8">
        <h2 className="section-subtitle mb-6">Confirm your Project Details</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-1">
              Project Name
            </label>
            <input
              type="text"
              id="projectName"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label htmlFor="projectDescription" className="block text-sm font-medium text-gray-700 mb-1">
              Project Description / Tagline
            </label>
            <textarea
              id="projectDescription"
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              rows={3}
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Project Type Selection */}
      <div className="card mb-8">
        <h2 className="section-subtitle mb-6">What type of project is this?</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {projectTypes.map((type) => {
            const IconComponent = type.icon;
            const isSelected = projectType === type.id;

            return (
              <div
                key={type.id}
                className={`card cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? "ring-2 ring-primary-500 bg-primary-50 border-primary-200"
                    : "hover:shadow-md hover:border-gray-300"
                }`}
                onClick={() => setProjectType(type.id)}
              >
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                    isSelected ? "bg-primary-600" : "bg-gray-100"
                  }`}
                >
                  <IconComponent
                    className={`w-6 h-6 ${
                      isSelected ? "text-white" : "text-gray-600"
                    }`}
                  />
                </div>
                <h3 className="text-lg font-semibold mb-2">{type.title}</h3>
                <p className="text-gray-600 text-sm mb-3">{type.description}</p>
                <p className="text-xs text-gray-500 italic">{type.examples}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Team Context Selection */}
      <div className="card mb-8">
        <h2 className="section-subtitle mb-6">Who worked on this project?</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {teamContexts.map((context) => {
            const IconComponent = context.icon;
            const isSelected = teamContext === context.id;

            return (
              <div
                key={context.id}
                className={`card cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? "ring-2 ring-primary-500 bg-primary-50 border-primary-200"
                    : "hover:shadow-md hover:border-gray-300"
                }`}
                onClick={() => setTeamContext(context.id as "Solo" | "Team")}
              >
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                    isSelected ? "bg-primary-600" : "bg-gray-100"
                  }`}
                >
                  <IconComponent
                    className={`w-6 h-6 ${
                      isSelected ? "text-white" : "text-gray-600"
                    }`}
                  />
                </div>
                <h3 className="text-lg font-semibold mb-2">{context.title}</h3>
                <p className="text-gray-600 text-sm mb-3">
                  {context.description}
                </p>
                <p className="text-xs text-gray-500 italic">
                  {context.examples}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Auto-detected Project Type Info */}
      {appState.repositoryMetadata?.detected_project_type && (
        <div className="card bg-blue-50 border-blue-200 mb-8">
          <h3 className="section-subtitle text-blue-800">
            Auto-detected Project Type
          </h3>
          <p className="text-blue-700 mb-3">
            We detected this as a{" "}
            <strong>{appState.repositoryMetadata.detected_project_type}</strong>{" "}
            based on the repository contents.
          </p>
          <p className="text-blue-600 text-sm">
            You can change this above if our detection was incorrect.
          </p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => goToStep("landing")}
          className="btn-outline flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          onClick={handleContinue}
          disabled={!canContinue}
          className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>Continue</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default SetupQuestions;
