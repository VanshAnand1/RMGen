import React, { useEffect, useState, useRef } from "react"; // Add useRef
import { apiService } from "../services/api";
import { AppState } from "../types";

interface AuthCallbackProps {
  updateAppState: (updates: Partial<AppState>) => void;
  goToStep: (
    step:
      | "landing"
      | "setup"
      | "sections"
      | "content"
      | "preview"
      | "authCallback"
      | "selectRepo"
  ) => void;
}

const AuthCallback: React.FC<AuthCallbackProps> = ({
  updateAppState,
  goToStep,
}) => {
  const [error, setError] = useState<string | null>(null);
  const hasProcessedCode = useRef(false); // Use useRef to prevent re-processing on re-renders

  useEffect(() => {
    if (hasProcessedCode.current) {
      return; // Already processed the code, prevent re-running
    }

    const searchParams = new URLSearchParams(window.location.search);
    const code = searchParams.get("code");

    if (code) {
      hasProcessedCode.current = true; // Mark as processed

      apiService
        .exchangeCodeForToken(code)
        .then((data) => {
          if (data.success && data.access_token) {
            updateAppState({ github_access_token: data.access_token });
            goToStep("selectRepo");
          } else {
            setError(data.error || "Failed to get access token.");
          }
        })
        .catch((err) => {
          setError("An error occurred during token exchange.");
        });
    } else {
      setError("No authorization code found.");
    }
  }, [goToStep, updateAppState]);

  return (
    <div className="max-w-md mx-auto text-center py-12">
      {error ? (
        <div className="card bg-red-50 border-red-200">
          <h2 className="text-xl font-semibold text-red-800 mb-4">
            Authentication Failed
          </h2>
          <p className="text-red-700 mb-6">{error}</p>
          <button onClick={() => goToStep("landing")} className="btn-primary">
            Go back to Landing Page
          </button>
        </div>
      ) : (
        <div className="card bg-blue-50 border-blue-200">
          <h2 className="text-xl font-semibold text-blue-800 mb-4">
            Authenticating with GitHub...
          </h2>
          <p className="text-blue-700">
            Please wait while we process your authentication.
          </p>
        </div>
      )}
    </div>
  );
};

export default AuthCallback;
