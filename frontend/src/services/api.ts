import {
  RepositoryInput,
  RepositoryMetadata,
  ApiResponse,
  SectionContent,
} from "../types";

const API_BASE_URL = "http://localhost:5001/api";

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("API request failed:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  async validateRepository(
    input: RepositoryInput
  ): Promise<ApiResponse<RepositoryMetadata>> {
    let payload: any = {};

    if (input.method === "url") {
      payload.repo_url = input.repoUrl;
    } else if (input.method === "owner-repo") {
      payload.owner = input.owner;
      payload.repo_name = input.repoName;
    } else {
      throw new Error("Invalid repository input method");
    }

    return this.request<RepositoryMetadata>("/validate-repo", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async generateReadme(
    projectType: string,
    teamContext: string,
    selectedSections: string[],
    sectionContent: SectionContent,
    repoMetadata: RepositoryMetadata | null
  ): Promise<ApiResponse<string>> {
    const payload = {
      project_type: projectType,
      team_context: teamContext,
      selected_sections: selectedSections,
      section_content: sectionContent,
      repo_metadata: repoMetadata || {},
    };

    return this.request<string>("/generate-readme", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async getGitHubOAuthUrl(): Promise<ApiResponse<string>> {
    return this.request<string>("/github-oauth-url");
  }

  async exchangeCodeForToken(code: string): Promise<ApiResponse<string>> {
    return this.request<string>("/github-callback", {
      method: "POST",
      body: JSON.stringify({ code }),
    });
  }

  async getUserRepositories(accessToken: string): Promise<ApiResponse<any[]>> {
    return this.request<any[]>("/github-repos", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }

  async healthCheck(): Promise<ApiResponse<any>> {
    return this.request<any>("/health");
  }

  async refineReadme(currentContent: string, prompt: string): Promise<ApiResponse<string>> {
    const payload = {
      current_content: currentContent,
      prompt: prompt,
    };

    return this.request<string>("/refine-readme", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }
}

export const apiService = new ApiService();
export default apiService;
