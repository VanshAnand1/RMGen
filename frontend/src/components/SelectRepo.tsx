import React, { useEffect, useState } from 'react';
import { AppState, GithubRepo } from '../types';
import { apiService } from '../services/api';
import { Loader2, Github as GithubIcon, ArrowRight, AlertCircle } from 'lucide-react';

interface SelectRepoProps {
  appState: AppState;
  updateAppState: (updates: Partial<AppState>) => void;
  goToStep: (step: "landing" | "setup" | "sections" | "content" | "preview" | "authCallback" | "selectRepo") => void;
}

const SelectRepo: React.FC<SelectRepoProps> = ({ appState, updateAppState, goToStep }) => {
  const [repos, setRepos] = useState<GithubRepo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRepo, setSelectedRepo] = useState<GithubRepo | null>(null);

  useEffect(() => {
    if (!appState.github_access_token) {
      setError('GitHub access token not found. Please re-authenticate.');
      setIsLoading(false);
      return;
    }

    const fetchRepos = async () => {
      try {
        const result = await apiService.getUserRepositories(appState.github_access_token!);
        if (result.success && result.repos) {
          setRepos(result.repos);
        } else {
          setError(result.error || 'Failed to fetch repositories.');
        }
      } catch (err) {
        setError('An error occurred while fetching repositories.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRepos();
  }, [appState.github_access_token]);

  const handleRepoSelect = (repo: GithubRepo) => {
    setSelectedRepo(repo);
  };

  const handleContinue = async () => {
    if (!selectedRepo) {
      setError('Please select a repository to continue.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const inputData = {
        method: "owner-repo" as "owner-repo", // Explicitly cast
        owner: selectedRepo.full_name.split('/')[0],
        repoName: selectedRepo.name,
        repoUrl: '', // Not used for owner-repo method
      };
      const result = await apiService.validateRepository(inputData);

      if (result.valid && result.metadata) {
        updateAppState({
          repositoryInput: inputData,
          repositoryMetadata: result.metadata,
        });
        goToStep('setup');
      } else {
        setError(result.error || 'Failed to validate selected repository.');
      }
    } catch (err) {
      setError('An error occurred during repository validation.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <div className="card bg-blue-50 border-blue-200">
          <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-blue-600" />
          <h2 className="text-xl font-semibold text-blue-800 mb-4">Loading Repositories...</h2>
          <p className="text-blue-700">Please wait while we fetch your GitHub repositories.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <div className="card bg-red-50 border-red-200">
          <AlertCircle className="w-8 h-8 mx-auto mb-4 text-red-600" />
          <h2 className="text-xl font-semibold text-red-800 mb-4">Error</h2>
          <p className="text-red-700 mb-6">{error}</p>
          <button onClick={() => goToStep('landing')} className="btn-primary">Go back to Landing Page</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="text-center mb-12">
        <h1 className="section-title text-4xl mb-4">Select a Repository</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Choose one of your GitHub repositories to generate a README for.
        </p>
      </div>

      <div className="card mb-8">
        <h2 className="section-subtitle mb-6">Your Repositories</h2>
        {repos.length === 0 ? (
          <p className="text-gray-600 text-center">No repositories found or you don't have access to any.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {repos.map((repo) => (
              <div
                key={repo.id}
                className={`card cursor-pointer transition-all duration-200 ${
                  selectedRepo?.id === repo.id
                    ? 'ring-2 ring-primary-500 bg-primary-50 border-primary-200'
                    : 'hover:shadow-md hover:border-gray-300'
                }`}
                onClick={() => handleRepoSelect(repo)}
              >
                <div className="flex items-center space-x-3 mb-2">
                  <GithubIcon className="w-5 h-5 text-gray-600" />
                  <h3 className="text-lg font-semibold">{repo.full_name}</h3>
                </div>
                <p className="text-gray-600 text-sm mb-2">{repo.description || 'No description'}</p>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  {repo.language && <span>Language: {repo.language}</span>}
                  <span>Stars: {repo.stars}</span>
                  <span>Private: {repo.private ? 'Yes' : 'No'}</span>
                </div>
              </div>
            ))
            }
          </div>
        )}
      </div>

      <div className="flex justify-end items-center">
        <button
          onClick={handleContinue}
          disabled={!selectedRepo || isLoading}
          className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>Continue with Selected Repository</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div >
  );
};

export default SelectRepo;
