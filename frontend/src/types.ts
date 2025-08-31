export interface RepositoryInput {
  method: "url" | "owner-repo" | "oauth" | "skip";
  repoUrl: string;
  owner: string;
  repoName: string;
}

export interface RepositoryMetadata {
  name: string;
  description: string;
  language: string;
  license: string;
  stars: number;
  forks: number;
  topics: string[];
  default_branch: string;
  created_at: string;
  updated_at: string;
  existing_readme?: string;
  contributors: Contributor[];
  owner: string;
  repo_name: string;
  detected_project_type: string;
  detected_team_context?: 'Solo' | 'Team';
}

export interface Contributor {
  login: string;
  name: string;
  contributions: number;
}

export interface SectionContent {
  [key: string]: string;
}

export interface AppState {
  currentStep: "landing" | "setup" | "sections" | "content" | "preview" | "authCallback" | "selectRepo";
  repositoryInput: RepositoryInput;
  repositoryMetadata: RepositoryMetadata | null;
  projectType: string;
  teamContext: "Solo" | "Team";
  selectedSections: string[];
  sectionContent: SectionContent;
  generatedContent: string;
  isLoading: boolean;
  error: string | null;
  github_access_token: string | null;
}

export interface ReadmeSection {
  id: string;
  title: string;
  description: string;
  required: boolean;
  defaultContent?: string;
}

export interface GithubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string;
  language: string;
  private: boolean;
  fork: boolean;
  updated_at: string;
  stars: number;
  forks: number;
}

export interface ApiResponse<T> {
  success?: boolean;
  valid?: boolean;
  data?: T;
  error?: string;
  metadata?: RepositoryMetadata;
  content?: string;
  oauth_url?: string;
  access_token?: string;
  repos?: GithubRepo[];
}