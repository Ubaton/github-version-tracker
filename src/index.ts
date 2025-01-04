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
    return `https://raw.githubusercontent.com/${this.repository}/${this.branch}/${this.path}`;
  }

  async getVersion(): Promise<PackageInfo> {
    try {
      const response = await axios.get(this.buildGitHubUrl());
      const packageData = response.data;

      return {
        currentVersion: packageData.version,
        lastUpdated: new Date(),
        repository: this.repository,
      };
    } catch (error: any) {
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
