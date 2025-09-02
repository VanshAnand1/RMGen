import React, { useState } from "react";
import { AppState, ReadmeSection } from "../types";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  BookOpen,
  Info,
  Code,
  Users,
  FileText,
  Download,
  Heart,
  HelpCircle,
  Map,
} from "lucide-react";

interface SectionSelectionProps {
  appState: AppState;
  updateAppState: (updates: Partial<AppState>) => void;
  goToStep: (
    step: "landing" | "setup" | "sections" | "content" | "preview"
  ) => void;
}

const SectionSelection: React.FC<SectionSelectionProps> = ({
  appState,
  updateAppState,
  goToStep,
}) => {
  const [selectedSections, setSelectedSections] = useState<string[]>(
    appState.selectedSections
  );

  const availableSections: ReadmeSection[] = [
    {
      id: "inspiration",
      title: "Inspiration",
      description:
        "What inspired you to create this project and the problem it solves",
      required: false,
    },
    {
      id: "journey",
      title: "Development Journey",
      description:
        "The story behind building this project and what you learned",
      required: false,
    },
    {
      id: "installation",
      title: "Installation Instructions",
      description:
        "Step-by-step guide on how to install and set up the project",
      required: false,
    },
    {
      id: "usage",
      title: "Usage Instructions",
      description: "How to use the project with examples and code snippets",
      required: false,
    },
    {
      id: "tech-stack",
      title: "Tech Stack",
      description: "Technologies, frameworks, and tools used in the project",
      required: false,
      defaultContent:
        appState.repositoryMetadata?.language || "Various technologies",
    },
    {
      id: "contributing",
      title: "Contributing Guidelines",
      description: "How others can contribute to the project",
      required: false,
    },
    {
      id: "license",
      title: "License Information",
      description: "Project license and usage terms",
      required: false,
      defaultContent: appState.repositoryMetadata?.license || "MIT",
    },
    {
      id: "credits",
      title: "Credits & Acknowledgments",
      description: "Thank contributors and acknowledge inspirations",
      required: false,
    },
    {
      id: "troubleshooting",
      title: "Troubleshooting & FAQ",
      description: "Common issues and frequently asked questions",
      required: false,
    },
    {
      id: "roadmap",
      title: "Future Features & Roadmap",
      description: "Planned features and development roadmap",
      required: false,
    },
  ];

  const handleSectionToggle = (sectionId: string) => {
    setSelectedSections((prev) => {
      if (prev.includes(sectionId)) {
        return prev.filter((id) => id !== sectionId);
      } else {
        return [...prev, sectionId];
      }
    });
  };

  const handleContinue = () => {
    // Ensure required sections are always included
    const requiredSections = availableSections
      .filter((section) => section.required)
      .map((section) => section.id);

    const finalSections = [
      ...Array.from(new Set([...requiredSections, ...selectedSections])),
    ];

    updateAppState({
      selectedSections: finalSections,
    });
    goToStep("content");
  };

  const canContinue = true;

  const getSectionIcon = (sectionId: string) => {
    const iconMap: { [key: string]: any } = {
      inspiration: Heart,
      journey: Map,
      installation: Download,
      usage: Code,
      "tech-stack": Info,
      contributing: Users,
      license: FileText,
      credits: Users,
      troubleshooting: HelpCircle,
      roadmap: Map,
    };
    return iconMap[sectionId] || BookOpen;
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="text-center mb-12">
        <h1 className="section-title text-4xl mb-4">
          Choose Your README Sections
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Select which sections you'd like to include in your README. Required
          sections are automatically included.
        </p>
      </div>

      {/* Section Selection Grid */}
      <div className="card mb-8">
        <div className="grid md:grid-cols-2 gap-4">
          {availableSections.map((section) => {
            const IconComponent = getSectionIcon(section.id);
            const isSelected =
              selectedSections.includes(section.id) || section.required;
            const isRequired = section.required;

            return (
              <div
                key={section.id}
                className={`card cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? "ring-2 ring-primary-500 bg-primary-50 border-primary-200"
                    : "hover:shadow-md hover:border-gray-300"
                } ${isRequired ? "opacity-75" : ""}`}
                onClick={() => !isRequired && handleSectionToggle(section.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center mt-1 ${
                        isSelected ? "bg-primary-600" : "bg-gray-100"
                      }`}
                    >
                      <IconComponent
                        className={`w-4 h-4 ${
                          isSelected ? "text-white" : "text-gray-600"
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-gray-900">
                          {section.title}
                        </h3>
                        {isRequired && (
                          <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                            Required
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {section.description}
                      </p>
                      {section.defaultContent && (
                        <p className="text-xs text-gray-500 mt-1 italic">
                          Default: {section.defaultContent}
                        </p>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <div className="w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selection Summary */}
      <div className="card bg-blue-50 border-blue-200 mb-8">
        <h3 className="section-subtitle text-blue-800">Selection Summary</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <p>
              <strong>Total Sections:</strong>{" "}
              {selectedSections.length +
                availableSections.filter((s) => s.required).length}
            </p>
            <p>
              <strong>Required Sections:</strong>{" "}
              {availableSections.filter((s) => s.required).length}
            </p>
            <p>
              <strong>Optional Sections:</strong> {selectedSections.length}
            </p>
          </div>
          <div>
            <p>
              <strong>Table of Contents:</strong>{" "}
              {selectedSections.length +
                availableSections.filter((s) => s.required).length >
              3
                ? "Will be generated"
                : "Not needed"}
            </p>
            <p>
              <strong>Estimated README Size:</strong>{" "}
              {(selectedSections.length +
                availableSections.filter((s) => s.required).length) *
                2}{" "}
              paragraphs
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => goToStep("setup")}
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
          <span>Continue to Content Input</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default SectionSelection;
