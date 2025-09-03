import React, { useState, useEffect, useCallback } from "react";
import { AppState } from "../types";
import { apiService } from "../services/api";
import {
  ArrowLeft,
  Copy,
  Check,
  Download,
  RefreshCw,
  Loader2,
  Edit3,
  Eye,
  FileText,
} from "lucide-react";
import 'github-markdown-css/github-markdown.css';
import PreviewModal from "./PreviewModal";

interface PreviewProps {
  appState: AppState;
  updateAppState: (updates: Partial<AppState>) => void;
  goToStep: (
    step: "landing" | "setup" | "sections" | "content" | "preview"
  ) => void;
  resetApp: () => void;
}

const Preview: React.FC<PreviewProps> = ({
  appState,
  updateAppState,
  goToStep,
  resetApp,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [promptInput, setPromptInput] = useState(""); // New state for prompt input

  const handleApplyPrompt = async () => {
    if (!promptInput.trim()) {
      setError("Prompt cannot be empty.");
      return;
    }
    setIsGenerating(true);
    setError(null);

    try {
      // Call API to refine README based on prompt
      const result = await apiService.refineReadme(editedContent, promptInput);

      if (result.success && result.content) {
        const content = result.content;
        updateAppState({ generatedContent: content });
        setEditedContent(content);
        setPromptInput(""); // Clear prompt input after successful application
      } else {
        setError(result.error || "Failed to refine README content with prompt.");
      }
    } catch (err) {
      setError("An error occurred while refining the README.");
    } finally {
      setIsGenerating(false);
    }
  };

  const generateReadme = useCallback(async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const result = await apiService.generateReadme(
        appState.projectType,
        appState.teamContext,
        appState.selectedSections,
        appState.sectionContent,
        appState.repositoryMetadata
      );

      if (result.success && result.content) {
        const content = result.content;
        updateAppState({ generatedContent: content });
        setEditedContent(content);
      } else {
        setError(result.error || "Failed to generate README content");
      }
    } catch (err) {
      setError("An error occurred while generating the README");
    } finally {
      setIsGenerating(false);
    }
  }, [
    appState.projectType,
    appState.teamContext,
    appState.selectedSections,
    appState.sectionContent,
    appState.repositoryMetadata,
    updateAppState,
  ]);

  useEffect(() => {
    if (!appState.generatedContent) {
      generateReadme();
    } else {
      setEditedContent(appState.generatedContent);
    }
  }, [appState.generatedContent, generateReadme]);

  const handleCopyContent = async () => {
    try {
      await navigator.clipboard.writeText(editedContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setError("Failed to copy content to clipboard");
    }
  };

  const handleDownload = () => {
    const blob = new Blob([editedContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "README.md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRegenerate = () => {
    setIsEditing(false);
    generateReadme();
  };

  const handleSaveEdits = () => {
    updateAppState({ generatedContent: editedContent });
    setIsEditing(false);
  };

  const handleCancelEdits = () => {
    setEditedContent(appState.generatedContent);
    setIsEditing(false);
  };

  if (isGenerating) {
    return (
      <div className="max-w-4xl mx-auto text-center animate-fade-in">
        <div className="card">
          <div className="flex items-center justify-center mb-6">
            <Loader2 className="w-12 h-12 text-primary-600 animate-spin" />
          </div>
          <h2 className="section-title text-2xl mb-4">
            Generating Your README
          </h2>
          <p className="text-gray-600 mb-6">
            Our AI is crafting a professional README based on your inputs. This
            may take a few moments...
          </p>
          <div className="bg-gray-100 rounded-lg p-4 text-sm text-gray-600">
            <p>
              <strong>What's happening:</strong>
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Analyzing your project type and team context</li>
              <li>Processing your section content and preferences</li>
              <li>Generating professional Markdown content</li>
              <li>Ensuring proper formatting and structure</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto text-center animate-fade-in">
        <div className="card border-red-200 bg-red-50">
          <h2 className="section-title text-2xl mb-4 text-red-800">
            Generation Failed
          </h2>
          <p className="text-red-600 mb-6">{error}</p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={generateReadme}
              className="btn-primary flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Try Again</span>
            </button>
            <button onClick={() => goToStep("content")} className="btn-outline">
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="text-center mb-8">
        <h1 className="section-title text-4xl mb-4">Your README is Ready!</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Review, edit, and download your professionally generated README.md file.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        <button
          onClick={() => setIsEditing(true)}
          className={`btn-outline flex items-center space-x-2 ${isEditing ? "bg-primary-50 border-primary-300" : ""}`}
        >
          <Edit3 className="w-4 h-4" />
          <span>Edit Content</span>
        </button>

        <button
          onClick={() => setIsPreviewModalOpen(true)}
          className="btn-outline flex items-center space-x-2"
        >
          <Eye className="w-4 h-4" />
          <span>Show Fullscreen Preview</span>
        </button>

        <button
          onClick={handleRegenerate}
          className="btn-outline flex items-center space-x-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Regenerate</span>
        </button>

        <button
          onClick={handleCopyContent}
          className="btn-outline flex items-center space-x-2"
        >
          {copied ? (
            <Check className="w-4 h-4" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
          <span>{copied ? "Copied!" : "Copy Content"}</span>
        </button>

        <button
          onClick={handleDownload}
          className="btn-primary flex items-center space-x-2"
        >
          <Download className="w-4 h-4" />
          <span>Download README.md</span>
        </button>
      </div>

      <div className="max-w-6xl mx-auto animate-fade-in"> {/* Removed flex-col lg:flex-row and gap-8 */}
        {/* Main Content Area (formerly Left Pane) */}
        <div className="flex-1"> {/* This div now contains all the main content */}
          {/* Content Display/Edit */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="section-subtitle flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Markdown Source</span>
              </h3>
              {isEditing && (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSaveEdits}
                    className="btn-primary text-sm px-3 py-1"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancelEdits}
                    className="btn-outline text-sm px-3 py-1"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {isEditing ? (
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                onKeyDown={(e) => {
                  if (e.shiftKey && e.key === "I") {
                    e.preventDefault();
                  }
                }}
                className="w-full h-96 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none font-mono text-sm"
                placeholder="Edit your README content here..."
              />
            ) : (
              <div className="w-full h-96 border border-gray-300 rounded-lg bg-gray-50 overflow-auto">
                <pre className="font-mono text-sm text-gray-800 whitespace-pre-wrap p-4 w-full h-full box-border">
                  {editedContent}
                </pre>
              </div>
            )}
          </div>

          {/* Refine with AI */}
          <div className="card mt-8">
            <h3 className="section-subtitle mb-4">Refine with AI</h3>
            <textarea
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none text-sm"
              placeholder="Type your prompt here to refine the README (e.g., 'Make the installation section more concise', 'Add a section about contributing')..."
            ></textarea>
            <button onClick={handleApplyPrompt} className="btn-primary w-full mt-3" disabled={isGenerating}>
              {isGenerating ? "Applying..." : "Apply Prompt"}
            </button>
          </div>

          {/* Project Summary */}
          <div className="card bg-gray-50 border-gray-200 mt-8">
            <h3 className="section-subtitle text-gray-800">Project Summary</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <p><strong>Project Type:</strong> {appState.projectType}</p>
                <p><strong>Team Context:</strong> {appState.teamContext}</p>
                <p><strong>Total Sections:</strong> {appState.selectedSections.length}</p>
              </div>
              <div>
                <p><strong>Repository:</strong> {appState.repositoryMetadata?.name || "N/A"}</p>
                <p><strong>Language:</strong> {appState.repositoryMetadata?.language || "N/A"}</p>
                <p><strong>License:</strong> {appState.repositoryMetadata?.license || "N/A"}</p>
              </div>
              <div>
                <p><strong>Content Length:</strong> {editedContent.length} characters</p>
                <p><strong>Estimated Lines:</strong> {editedContent.split("\n").length}</p>
                <p><strong>Generated:</strong> {new Date().toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8">
            <button
              onClick={() => goToStep("content")}
              className="btn-outline flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Content</span>
            </button>

            <div className="flex space-x-4">
              <button onClick={resetApp} className="btn-outline">Start Over</button>
              <button
                onClick={handleDownload}
                className="btn-primary flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download README.md</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <PreviewModal 
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        content={editedContent}
      />
    </>
  );
}

export default Preview;
