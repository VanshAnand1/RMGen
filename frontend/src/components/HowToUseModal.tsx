import React from 'react';

interface HowToUseModalProps {
  onClose: () => void;
}

const HowToUseModal: React.FC<HowToUseModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full">
        <h2 className="text-2xl font-bold mb-4">How to Use RMGen</h2>
        <div className="space-y-4 text-gray-700">
          <p>
            <strong>1. Provide a Repository (Optional):</strong> You can start by providing a public GitHub repository.
            You have three options:
          </p>
          <ul className="list-disc list-inside pl-4 space-y-2">
            <li>Paste the repository URL.</li>
            <li>Enter the owner and repository name.</li>
            <li>
              <strong>Or connect your GitHub account:</strong> Click "Sign in with GitHub" in the header to see a list of your own repositories to choose from.
            </li>
          </ul>
          <p>
            You can also choose to start from scratch without providing a repository.
          </p>
          <p>
            <strong>2. Choose Sections:</strong> Select the sections you want to include in your README file. You can also provide your own content for each section.
          </p>
          <p>
            <strong>3. Generate README:</strong> Click the "Generate README" button to let our AI create a professional README for you.
          </p>
          <p>
            <strong>4. Preview and Copy:</strong> You can preview the generated README, tailor it with AI, and copy the Markdown content to use in your project.
          </p>
        </div>
        <div className="text-right mt-6">
          <button onClick={onClose} className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-700">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default HowToUseModal;
