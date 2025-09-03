import React, { useState } from 'react';
import { BookOpen, Github } from 'lucide-react';
import HowToUseModal from './HowToUseModal';
import ConfirmationModal from './ConfirmationModal';

interface HeaderProps {
  user: any | null;
  onLogin: () => void;
  resetApp: () => void;
  currentStep: string;
}

const Header: React.FC<HeaderProps> = ({ user, onLogin, resetApp, currentStep }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showHowToUse, setShowHowToUse] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLogoClick = () => {
    const progressSteps = ['setup', 'sections', 'content', 'preview', 'selectRepo'];
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

            <nav className="flex items-center space-x-4">
              <button onClick={() => setShowHowToUse(true)} className="text-gray-600 hover:text-gray-900 transition-colors duration-200">
                How to Use
              </button>
              {user ? (
                <div className="relative">
                  <button onClick={() => setShowDropdown(!showDropdown)} className="flex items-center focus:outline-none">
                    <img src={user.avatar_url} alt="User Avatar" className="w-8 h-8 rounded-full" />
                  </button>
                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                      <a href={user.html_url} target="_blank" rel="noopener noreferrer" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Your Profile
                      </a>
                      <button onClick={resetApp} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Logout & Start Over
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button onClick={onLogin} className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200">
                  <Github className="w-5 h-5" />
                  <span>Sign in with GitHub</span>
                </button>
              )}
            </nav>
          </div>
        </div>
      </header>
      {showHowToUse && <HowToUseModal onClose={() => setShowHowToUse(false)} />}
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
