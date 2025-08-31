import React, { useEffect, useState, useMemo } from 'react';
import { AppState, GithubRepo } from '../types';
import { apiService } from '../services/api';
import { Loader2, Github as GithubIcon, ArrowRight, AlertCircle, ArrowDown, Search, CheckCircle } from 'lucide-react';

interface SelectRepoProps {
  appState: AppState;
  updateAppState: (updates: Partial<AppState>) => void;
  goToStep: (step: "landing" | "setup" | "sections" | "content" | "preview" | "authCallback" | "selectRepo") => void;
}

const SelectRepo: React.FC<SelectRepoProps> = ({ appState, updateAppState, goToStep }) => {
  const [repos, setRepos] = useState<GithubRepo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRepo, setSelectedRepo] = useState<GithubRepo | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showContinueCue, setShowContinueCue] = useState(false);

  // Fetch repositories on component mount
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

  // Filter repositories based on search query
  const filteredRepos = useMemo(() => {
    const lowercasedQuery = searchQuery.toLowerCase();
    const filtered = repos.filter(repo => 
      repo.full_name.toLowerCase().includes(lowercasedQuery)
    );

    // Ensure the selected repo is always in the list
    if (selectedRepo && !filtered.some(repo => repo.id === selectedRepo.id)) {
      return [selectedRepo, ...filtered];
    }
    return filtered;
  }, [repos, searchQuery, selectedRepo]);

  const handleRepoSelect = (repo: GithubRepo) => {
    setSelectedRepo(repo);
    setShowContinueCue(true);
  };

  const handleContinue = async () => {
    if (!selectedRepo) {
      setError('Please select a repository to continue.');
      return;
    }

    setShowContinueCue(false);
    setIsValidating(true);
    setError(null);

    try {
      const inputData = {
        method: "owner-repo" as const,
        owner: selectedRepo.full_name.split('/')[0],
        repoName: selectedRepo.name,
        repoUrl: '',
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
      setIsValidating(false);
    }
  };

  // Loading and error states
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
    <div className="max-w-7xl mx-auto animate-fade-in">
      <div className="text-center mb-12">
        <h1 className="section-title text-4xl mb-4">Select a Repository</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Choose one of your GitHub repositories to generate a README for.
        </p>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Left Column: Search and Repo List */}
        <div className="col-span-12 md:col-span-8">
          <div className="card mb-8">
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search your repositories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10"
              />
            </div>

            <h2 className="section-subtitle">Your Repositories ({filteredRepos.length})</h2>
            {filteredRepos.length === 0 ? (
              <p className="text-gray-600 text-center py-8">No repositories match your search.</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {filteredRepos.map((repo) => (
                  <div
                    key={repo.id}
                    className={`card cursor-pointer transition-all duration-200 relative ${
                      selectedRepo?.id === repo.id
                        ? 'ring-2 ring-primary-500 bg-primary-50 border-primary-200'
                        : 'hover:shadow-md hover:border-gray-300'
                    }`}
                    onClick={() => handleRepoSelect(repo)}
                  >
                    {selectedRepo?.id === repo.id && (
                      <div className="absolute top-2 right-2 flex items-center space-x-1 bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                        <CheckCircle className="w-3 h-3" />
                        <span>Selected</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-3 mb-2">
                      <GithubIcon className="w-5 h-5 text-gray-600" />
                      <h3 className="text-lg font-semibold">{repo.full_name}</h3>
                    </div>
                    <p className="text-gray-600 text-sm mb-2 truncate">{repo.description || 'No description'}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      {repo.language && <span>{repo.language}</span>}
                      <span>&#9733; {repo.stars}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Selected Repo and Actions */}
        <div className="col-span-12 md:col-span-4">
          <div className="sticky top-24 space-y-6">
            <div className={`card transition-all duration-300 ${selectedRepo ? 'bg-white' : 'bg-gray-50'}`}>
              <h2 className="section-subtitle">Selected Repository</h2>
              {selectedRepo ? (
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-primary-700">{selectedRepo.full_name}</h3>
                  <p className="text-sm text-gray-600">{selectedRepo.description || 'No description provided.'}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 pt-2">
                    {selectedRepo.language && <span>{selectedRepo.language}</span>}
                    <span>&#9733; {selectedRepo.stars}</span>
                    <span>{selectedRepo.private ? 'Private' : 'Public'}</span>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">Please select a repository from the list.</p>
              )}
            </div>

            {showContinueCue && (
              <div onClick={() => setShowContinueCue(false)} className="cursor-pointer p-3 bg-primary-50 border-2 border-dashed border-primary-300 rounded-lg flex items-center space-x-3 text-center shadow-lg animate-fade-in">
                <ArrowDown className="w-6 h-6 text-primary-600 animate-bounce-slow" />
                <span className="text-md font-semibold text-primary-700">Ready? Click continue!</span>
              </div>
            )}

            <button
              onClick={handleContinue}
              disabled={!selectedRepo || isLoading || isValidating}
              className="btn-primary w-full flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isValidating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Validating...</span>
                </>
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectRepo;
