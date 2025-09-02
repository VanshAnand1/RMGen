import React, { useState, useEffect, useMemo } from "react";
import { AppState, SectionContent } from "../types";
import {
  ArrowLeft,
  ArrowRight,
  Copy,
  Check,
  Info,
  Code,
  Users,
  FileText,
  Download,
  Heart,
  HelpCircle,
  Map,
  Sparkles,
} from "lucide-react";

interface ContentInputProps {
  appState: AppState;
  updateAppState: (updates: Partial<AppState>) => void;
  goToStep: (
    step: "landing" | "setup" | "sections" | "content" | "preview"
  ) => void;
}

const ContentInput: React.FC<ContentInputProps> = ({
  appState,
  updateAppState,
  goToStep,
}) => {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [sectionContent, setSectionContent] = useState<SectionContent>(
    appState.sectionContent
  );
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const availableSections = [
    {
      id: "inspiration",
      title: "Inspiration",
      description:
        "What inspired you to create this project and the problem it solves",
      icon: Heart,
      placeholder: "Share what inspired you to build this project...",
      defaultContent: "",
    },
    {
      id: "journey",
      title: "Development Journey",
      description:
        "The story behind building this project and what you learned",
      icon: Map,
      placeholder: "Describe your development journey and key learnings...",
      defaultContent: "",
    },
    {
      id: "installation",
      title: "Installation Instructions",
      description:
        "Step-by-step guide on how to install and set up the project",
      icon: Download,
      placeholder: "Provide clear installation steps...",
      defaultContent: "",
    },
    {
      id: "usage",
      title: "Usage Instructions",
      description: "How to use the project with examples and code snippets",
      icon: Code,
      placeholder: "Explain how to use your project with examples...",
      defaultContent: "",
    },
    {
      id: "tech-stack",
      title: "Tech Stack",
      description: "Technologies, frameworks, and tools used in the project",
      icon: Info,
      placeholder: "List the technologies and tools used...",
      defaultContent:
        appState.repositoryMetadata?.language || "Various technologies",
    },
    {
      id: "contributing",
      title: "Contributing Guidelines",
      description: "How others can contribute to the project",
      icon: Users,
      placeholder: "Explain how others can contribute...",
      defaultContent: "",
    },
    {
      id: "license",
      title: "License Information",
      description: "Project license and usage terms",
      icon: FileText,
      placeholder: "Specify the license and usage terms...",
      defaultContent: appState.repositoryMetadata?.license || "MIT",
    },
    {
      id: "credits",
      title: "Credits & Acknowledgments",
      description: "Thank contributors and acknowledge inspirations",
      icon: Users,
      placeholder: "Acknowledge contributors and inspirations...",
      defaultContent: "",
    },
    {
      id: "troubleshooting",
      title: "Troubleshooting & FAQ",
      description: "Common issues and frequently asked questions",
      icon: HelpCircle,
      placeholder: "List common issues and their solutions...",
      defaultContent: "",
    },
    {
      id: "roadmap",
      title: "Future Features & Roadmap",
      description: "Planned features and development roadmap",
      icon: Map,
      placeholder: "Outline your future plans and roadmap...",
      defaultContent: "",
    },
  ];

  const selectedSections = useMemo(
    () =>
      availableSections.filter((section) =>
        appState.selectedSections.includes(section.id)
      ),
    [appState.selectedSections]
  );

  const currentSection = useMemo(
    () => selectedSections[currentSectionIndex],
    [selectedSections, currentSectionIndex]
  );

  useEffect(() => {
    // Initialize content for current section if not exists
    if (currentSection && !sectionContent[currentSection.id]) {
      setSectionContent((prev) => ({
        ...prev,
        [currentSection.id]: currentSection.defaultContent || "",
      }));
    }
  }, [currentSection]); // Removed sectionContent from dependencies to prevent infinite loop

  const handleContentChange = (content: string) => {
    setSectionContent((prev) => ({
      ...prev,
      [currentSection.id]: content,
    }));
  };

  const handleUseExistingReadme = () => {
    if (appState.repositoryMetadata?.existing_readme) {
      // Populate the textarea with the full content of the existing README
      handleContentChange(appState.repositoryMetadata.existing_readme);
    }
  };

  const handleCopyContent = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedSection(currentSection.id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleNext = () => {
    if (currentSectionIndex < selectedSections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
    } else {
      // Save content and move to preview
      updateAppState({ sectionContent });
      goToStep("preview");
    }
  };

  const handlePrevious = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
    } else {
      goToStep("sections");
    }
  };

  const canContinue = useMemo(
    () =>
      currentSection && sectionContent[currentSection.id]?.trim().length > 0,
    [currentSection, sectionContent]
  );

  const progressPercentage = useMemo(
    () => ((currentSectionIndex + 1) / selectedSections.length) * 100,
    [currentSectionIndex, selectedSections.length]
  );

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Section {currentSectionIndex + 1} of {selectedSections.length}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round(progressPercentage)}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      <div className="text-center mb-8">
        <h1 className="section-title text-4xl mb-4">{currentSection?.title}</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          {currentSection?.description}
        </p>
      </div>

      {/* Current Section Content Input */}
      <div className="card mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
              {currentSection &&
                React.createElement(currentSection.icon, {
                  className: "w-5 h-5 text-primary-600",
                })}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {currentSection?.title}
              </h3>
              <p className="text-sm text-gray-600">
                {currentSection?.description}
              </p>
            </div>
          </div>

          {/* Use Existing README Button */}
          {appState.repositoryMetadata?.existing_readme && (
            <button
              onClick={handleUseExistingReadme}
              className="btn-outline flex items-center space-x-2 text-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>Use Existing README</span>
            </button>
          )}
        </div>

        <textarea
          value={sectionContent[currentSection?.id || ""] || ""}
          onChange={(e) => handleContentChange(e.target.value)}
          onKeyDown={(e) => {
            // Prevent browser shortcuts from interfering with typing
            if (e.shiftKey && e.key === "I") {
              e.preventDefault();
            }
          }}
          placeholder={currentSection?.placeholder}
          className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none font-mono text-sm"
        />

        {/* Content Actions */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-500">
            {sectionContent[currentSection?.id || ""]?.length || 0} characters
          </div>

          <button
            onClick={() =>
              handleCopyContent(sectionContent[currentSection?.id || ""] || "")
            }
            className="btn-outline flex items-center space-x-2 text-sm"
          >
            {copiedSection === currentSection?.id ? (
              <>
                <Check className="w-4 h-4" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Content</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Section Navigation */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex space-x-2">
          {selectedSections.map((section, index) => (
            <button
              key={section.id}
              onClick={() => setCurrentSectionIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentSectionIndex
                  ? "bg-primary-600"
                  : index < currentSectionIndex
                  ? "bg-green-500"
                  : "bg-gray-300"
              }`}
              title={`Go to ${section.title}`}
            />
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center">
        <button
          onClick={handlePrevious}
          className="btn-outline flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>
            {currentSectionIndex === 0 ? "Back to Sections" : "Previous"}
          </span>
        </button>

        <button
          onClick={handleNext}
          disabled={!canContinue}
          className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>
            {currentSectionIndex === selectedSections.length - 1
              ? "Generate README"
              : "Next Section"}
          </span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ContentInput;
