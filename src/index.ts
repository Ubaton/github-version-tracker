import axios from "axios";

interface PackageTrackOptions {
  repository: string;
  branch?: string;
  path?: string;
}

interface PackageInfo {
  currentVersion: string;
  lastUpdated: Date;
  repository: string;
}

export class PackageTrack {
  private repository: string;
  private branch: string;
  private path: string;

  constructor(options: PackageTrackOptions) {
    this.repository = this.parseRepository(options.repository);
    this.branch = options.branch || "main";
    this.path = options.path || "package.json";
  }

  private parseRepository(repo: string): string {
    // Remove 'https://github.com/' if present
    const cleanRepo = repo.replace("https://github.com/", "");
    // Remove .git extension if present
    return cleanRepo.replace(".git", "");
  }

  private buildGitHubUrl(): string {
    // Use the GitHub API instead of raw.githubusercontent.com to avoid CORS issues
    return `https://api.github.com/repos/${this.repository}/contents/${this.path}?ref=${this.branch}`;
  }

  async getVersion(): Promise<PackageInfo> {
    try {
      const response = await axios.get(this.buildGitHubUrl(), {
        headers: {
          Accept: "application/vnd.github.v3.raw",
        },
      });

      let packageData;
      try {
        // Handle both direct JSON response and base64 encoded content
        if (response.data.content) {
          const content = Buffer.from(
            response.data.content,
            "base64"
          ).toString();
          packageData = JSON.parse(content);
        } else {
          packageData = response.data;
        }
      } catch (parseError) {
        throw new Error("Invalid package.json format");
      }

      if (!packageData.version) {
        throw new Error("No version field found in package.json");
      }

      return {
        currentVersion: packageData.version,
        lastUpdated: new Date(),
        repository: this.repository,
      };
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error(
            `Repository or file not found: ${this.repository}/${this.path}`
          );
        } else if (error.response?.status === 403) {
          throw new Error(
            "GitHub API rate limit exceeded. Consider using a personal access token."
          );
        }
        throw new Error(
          `GitHub API error: ${error.response?.status} ${error.response?.statusText}`
        );
      }
      throw new Error(`Failed to fetch package version: ${error.message}`);
    }
  }

  async checkForUpdates(currentVersion: string): Promise<{
    hasUpdate: boolean;
    latestVersion: string;
  }> {
    const { currentVersion: latestVersion } = await this.getVersion();
    return {
      hasUpdate: currentVersion !== latestVersion,
      latestVersion,
    };
  }
}

// Export default instance
export default PackageTrack;
