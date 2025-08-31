import React, { useState } from "react";
import { BookOpen, Github } from "lucide-react";
import { AppState } from "../types";
import ConfirmationModal from "./ConfirmationModal";

interface HeaderProps {
  currentStep: AppState['currentStep'];
  resetApp: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentStep, resetApp }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLogoClick = () => {
    const progressSteps: AppState['currentStep'][] = ['setup', 'sections', 'content', 'preview', 'selectRepo'];
    if (progressSteps.includes(currentStep)) {
      setIsModalOpen(true);
    } else {
      resetApp();
    }
  };

  const handleConfirm = () => {
    resetApp();
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4 max-w-6xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={handleLogoClick}>
              <div className="flex items-center justify-center w-10 h-10 bg-primary-600 rounded-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gradient">RMGen</h1>
                <p className="text-sm text-gray-600">Smart README Generator</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
              >
                <Github className="w-5 h-5" />
                <span className="hidden sm:inline">GitHub</span>
              </a>
            </div>
          </div>
        </div>
      </header>
      <ConfirmationModal
        isOpen={isModalOpen}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        message="Are you sure you want to go to the homepage? Your current progress will be lost."
      />
    </>
  );
};

export default Header;
