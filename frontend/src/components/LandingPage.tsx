import React, { useState } from "react";
import { AppState } from "../types";
import { apiService } from "../services/api";
import {
  Github,
  Link,
  User,
  SkipForward,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface LandingPageProps {
  appState: AppState;
  updateAppState: (updates: Partial<AppState>) => void;
  goToStep: (step: 'landing' | 'setup' | 'sections' | 'content' | 'preview') => void;
}

const LandingPage: React.FC<LandingPageProps> = ({
  appState,
  updateAppState,
  goToStep,
}) => {
  const [inputMethod, setInputMethod] = useState<
    "url" | "owner-repo" | "oauth" | "skip"
  >("url");
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    message: string;
  } | null>(null);

  const handleInputChange = (field: "repoUrl" | "owner" | "repoName", value: string) => {
    updateAppState({
      repositoryInput: {
        ...appState.repositoryInput,
        [field]: value,
      },
    });
  };

  const handleMethodChange = (
    method: "url" | "owner-repo" | "oauth" | "skip"
  ) => {
    setInputMethod(method);
    setValidationResult(null);
  };

  const handleStartFromScratch = () => {
    updateAppState({
      repositoryInput: {
        method: "skip",
        repoUrl: "",
        owner: "",
        repoName: "",
      },
      repositoryMetadata: null,
    });
    goToStep("setup");
  };

  const validateRepository = async () => {
    if (inputMethod === "skip") return;

    const { repoUrl, owner, repoName } = appState.repositoryInput;

    if (inputMethod === "url") {
      if (!repoUrl.trim()) {
        setValidationResult({
          valid: false,
          message: "Please enter a repository URL",
        });
        return;
      }
    } else if (inputMethod === "owner-repo") {
      if (!owner.trim() || !repoName.trim()) {
        setValidationResult({
          valid: false,
          message: "Please enter both owner and repository name",
        });
        return;
      }
    }

    setIsValidating(true);
    setValidationResult(null);

    try {
      const result = await apiService.validateRepository(appState.repositoryInput);

      if (result.valid && result.metadata) {
        setValidationResult({
          valid: true,
          message: "Repository validated successfully!",
        });

        updateAppState({
          repositoryMetadata: result.metadata,
        });

        setTimeout(() => {
          goToStep("setup");
        }, 1500);
      } else {
        setValidationResult({
          valid: false,
          message: result.error || "Failed to validate repository",
        });
      }
    } catch (error) {
      setValidationResult({
        valid: false,
        message: "An error occurred while validating the repository",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleOAuth = async () => {
    try {
      const result = await apiService.getGitHubOAuthUrl();
      if (result.oauth_url) {
        window.location.href = result.oauth_url;
      } else {
        setValidationResult({
          valid: false,
          message: "GitHub OAuth not configured",
        });
      }
    } catch (error) {
      setValidationResult({
        valid: false,
        message: "Failed to initiate GitHub OAuth",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="text-center mb-12">
        <h1 className="section-title text-4xl mb-4">
          Generate Professional READMEs with AI
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Create high-quality, customized README.md files for your GitHub
          repositories using our guided workflow and AI-powered content
          generation.
        </p>
        <p className="text-sm text-gray-500 mt-4 max-w-2xl mx-auto">
          Note: We do not support fetching private repository data yet. For private repos, please start from scratch.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        {/* Repository URL Input */}
        <div
          className={`card cursor-pointer transition-all duration-200 ${
            inputMethod === "url"
              ? "ring-2 ring-primary-500 bg-primary-50"
              : "hover:shadow-md"
          }`}
          onClick={() => handleMethodChange("url")}
        >
          <div className="flex items-center space-x-3 mb-4">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                inputMethod === "url" ? "bg-primary-600" : "bg-gray-100"
              }`}
            >
              <Link
                className={`w-5 h-5 ${
                  inputMethod === "url" ? "text-white" : "text-gray-600"
                }`}
              />
            </div>
            <h3 className="text-lg font-semibold">Repository URL</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Paste a GitHub repository URL to get started quickly
          </p>

          {inputMethod === "url" && (
            <div className="space-y-3">
              <input
                type="url"
                placeholder="https://github.com/username/repository"
                value={appState.repositoryInput.repoUrl}
                onChange={(e) => handleInputChange("repoUrl", e.target.value)}
                className="input-field"
                onClick={(e) => e.stopPropagation()}
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  validateRepository();
                }}
                disabled={isValidating}
                className="btn-primary w-full flex items-center justify-center"
              >
                {isValidating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Validating...
                  </>
                ) : (
                  "Validate Repository"
                )}
              </button>
            </div>
          )}
        </div>

        {/* Owner + Repository Name Input */}
        <div
          className={`card cursor-pointer transition-all duration-200 ${
            inputMethod === "owner-repo"
              ? "ring-2 ring-primary-500 bg-primary-50"
              : "hover:shadow-md"
          }`}
          onClick={() => handleMethodChange("owner-repo")}
        >
          <div className="flex items-center space-x-3 mb-4">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                inputMethod === "owner-repo" ? "bg-primary-600" : "bg-gray-100"
              }`}
            >
              <User
                className={`w-5 h-5 ${
                  inputMethod === "owner-repo" ? "text-white" : "text-gray-600"
                }`}
              />
            </div>
            <h3 className="text-lg font-semibold">Owner + Repository</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Enter the GitHub username and repository name separately
          </p>

          {inputMethod === "owner-repo" && (
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Username"
                value={appState.repositoryInput.owner}
                onChange={(e) => handleInputChange("owner", e.target.value)}
                className="input-field"
                onClick={(e) => e.stopPropagation()}
              />
              <input
                type="text"
                placeholder="Repository name"
                value={appState.repositoryInput.repoName}
                onChange={(e) => handleInputChange("repoName", e.target.value)}
                className="input-field"
                onClick={(e) => e.stopPropagation()}
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  validateRepository();
                }}
                disabled={isValidating}
                className="btn-primary w-full flex items-center justify-center"
              >
                {isValidating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Validating...
                  </>
                ) : (
                  "Validate Repository"
                )}
              </button>
            </div>
          )}
        </div>

        {/* Connect GitHub (OAuth) */}
        <div
          className={`card cursor-pointer transition-all duration-200 ${
            inputMethod === "oauth"
              ? "ring-2 ring-primary-500 bg-primary-50"
              : "hover:shadow-md"
          }`}
          onClick={() => handleMethodChange("oauth")}
        >
          <div className="flex items-center space-x-3 mb-4">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                inputMethod === "oauth" ? "bg-primary-600" : "bg-gray-100"
              }`}
            >
              <Github
                className={`w-5 h-5 ${
                  inputMethod === "oauth" ? "text-white" : "text-gray-600"
                }`}
              />
            </div>
            <h3 className="text-lg font-semibold">Connect GitHub</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Authenticate with GitHub to access your repositories
          </p>

          {inputMethod === "oauth" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleOAuth();
              }}
              className="btn-primary w-full"
            >
              Connect GitHub Account
            </button>
          )}
        </div>

        {/* Skip and Answer Questions */}
        <div
          className={`card cursor-pointer transition-all duration-200 ${
            inputMethod === "skip"
              ? "ring-2 ring-primary-500 bg-primary-50"
              : "hover:shadow-md"
          }`}
          onClick={() => handleMethodChange("skip")}
        >
          <div className="flex items-center space-x-3 mb-4">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                inputMethod === "skip" ? "bg-primary-600" : "bg-gray-100"
              }`}
            >
              <SkipForward
                className={`w-5 h-5 ${
                  inputMethod === "skip" ? "text-white" : "text-gray-600"
                }`}
              />
            </div>
            <h3 className="text-lg font-semibold">Start from Scratch</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Skip repository integration and answer questions to generate a
            README
          </p>

          {inputMethod === "skip" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleStartFromScratch();
              }}
              className="btn-primary w-full"
            >
              Start Generating
            </button>
          )}
        </div>
      </div>

      {/* Validation Result */}
      {validationResult && (
        <div
          className={`card ${
            validationResult.valid
              ? "border-green-200 bg-green-50"
              : "border-red-200 bg-red-50"
          }`}
        >
          <div className="flex items-center space-x-3">
            {validationResult.valid ? (
              <CheckCircle className="w-6 h-6 text-green-600" />
            ) : (
              <AlertCircle className="w-6 h-6 text-red-600" />
            )}
            <span
              className={
                validationResult.valid ? "text-green-800" : "text-red-800"
              }
            >
              {validationResult.message}
            </span>
          </div>
        </div>
      )}

      {/* Repository Info Display */}
      {appState.repositoryMetadata && (
        <div className="card bg-blue-50 border-blue-200">
          <h3 className="section-subtitle text-blue-800">
            Repository Information
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p>
                <strong>Name:</strong> {appState.repositoryMetadata.name}
              </p>
              <p>
                <strong>Description:</strong>{" "}
                {appState.repositoryMetadata.description || "No description"}
              </p>
              <p>
                <strong>Language:</strong>{" "}
                {appState.repositoryMetadata.language}
              </p>
            </div>
            <div>
              <p>
                <strong>License:</strong> {appState.repositoryMetadata.license}
              </p>
              <p>
                <strong>Stars:</strong> {appState.repositoryMetadata.stars}
              </p>
              <p>
                <strong>Forks:</strong> {appState.repositoryMetadata.forks}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;