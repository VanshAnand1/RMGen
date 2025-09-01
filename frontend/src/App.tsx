import React, { useState, useEffect, useCallback } from "react";
import { AppState } from "./types";
import LandingPage from "./components/LandingPage";
import SetupQuestions from "./components/SetupQuestions";
import SectionSelection from "./components/SectionSelection";
import ContentInput from "./components/ContentInput";
import Preview from "./components/Preview";
import Header from "./components/Header";
import AuthCallback from "./components/AuthCallback"; // New import
import SelectRepo from "./components/SelectRepo"; // New import

const getInitialStep = (): AppState["currentStep"] => {
  const token = sessionStorage.getItem("github_access_token");
  const path = window.location.pathname;

  if (path === "/auth/callback") {
    return "authCallback";
  }

  if (token) {
    return "selectRepo";
  }

  return "landing";
};

const getInitialState = (): AppState => {
  const storedState = sessionStorage.getItem("rmgen_app_state");
  const token = sessionStorage.getItem("github_access_token");

  let initialState: AppState = {
    currentStep: "landing",
    repositoryInput: {
      method: "url",
      repoUrl: "",
      owner: "",
      repoName: "",
    },
    repositoryMetadata: null,
    projectType: "Template",
    teamContext: "Solo",
    selectedSections: [],
    sectionContent: {},
    generatedContent: "",
    isLoading: false,
    error: null,
    github_access_token: token,
  };

  if (storedState) {
    try {
      const parsedState: AppState = JSON.parse(storedState);
      initialState = { ...initialState, ...parsedState };
      initialState.github_access_token = token;
      if (
        initialState.currentStep === "authCallback" &&
        window.location.pathname !== "/auth/callback"
      ) {
        initialState.currentStep = "landing";
      } else if (token && initialState.currentStep === "landing") {
        initialState.currentStep = "selectRepo";
      }
    } catch (e) {
      console.error("Failed to parse stored state:", e);
    }
  }

  if (window.location.pathname === "/auth/callback") {
    initialState.currentStep = "authCallback";
  } else if (token && initialState.currentStep === "landing") {
    initialState.currentStep = "selectRepo";
  }

  return initialState;
};

function App() {
  const [appState, setAppState] = useState<AppState>(getInitialState());

  useEffect(() => {
    sessionStorage.setItem("rmgen_app_state", JSON.stringify(appState));
  }, [appState]);

  const updateAppState = useCallback((updates: Partial<AppState>) => {
    setAppState((prev) => ({ ...prev, ...updates }));
  }, []);

  const goToStep = useCallback(
    (
      step:
        | "landing"
        | "setup"
        | "sections"
        | "content"
        | "preview"
        | "authCallback"
        | "selectRepo"
    ) => {
      updateAppState({ currentStep: step });
    },
    [updateAppState]
  );

  const resetApp = useCallback(() => {
    sessionStorage.removeItem("github_access_token");
    window.history.pushState({}, "", "/");
    setAppState(getInitialState());
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentStep={appState.currentStep} resetApp={resetApp} />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {appState.currentStep === "landing" && (
          <LandingPage
            appState={appState}
            updateAppState={updateAppState}
            goToStep={goToStep}
          />
        )}
        {appState.currentStep === "authCallback" && (
          <AuthCallback updateAppState={updateAppState} goToStep={goToStep} />
        )}
        {appState.currentStep === "selectRepo" && (
          <SelectRepo
            appState={appState}
            updateAppState={updateAppState}
            goToStep={goToStep}
          />
        )}
        {appState.currentStep === "setup" && (
          <SetupQuestions
            appState={appState}
            updateAppState={updateAppState}
            goToStep={goToStep}
          />
        )}
        {appState.currentStep === "sections" && (
          <SectionSelection
            appState={appState}
            updateAppState={updateAppState}
            goToStep={goToStep}
          />
        )}
        {appState.currentStep === "content" && (
          <ContentInput
            appState={appState}
            updateAppState={updateAppState}
            goToStep={goToStep}
          />
        )}
        {appState.currentStep === "preview" && (
          <Preview
            appState={appState}
            updateAppState={updateAppState}
            goToStep={goToStep}
            resetApp={resetApp}
          />
        )}
      </main>
    </div>
  );
}

export default App;
