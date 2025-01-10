import axios from "axios";
import semver from "semver";

interface PackageTrackOptions {
  repository: string;
  branch?: string;
  path?: string;
  authToken?: string;
  timeout?: number;
}

interface PackageJSON {
  version?: string;
  name?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

interface PackageInfo {
  currentVersion: string;
  lastUpdated: Date;
  repository: string;
  name?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

interface UpdateCheckResult {
  hasUpdate: boolean;
  latestVersion: string;
  currentVersion: string;
  updateType?: 'major' | 'minor' | 'patch';
}

export class PackageTrack {
  private readonly repository: string;
  private readonly branch: string;
  private readonly path: string;
  private readonly authToken?: string;
  private readonly timeout: number;
  private cache: Map<string, { data: PackageInfo; timestamp: number }> = new Map();
  private readonly cacheDuration = 5 * 60 * 1000; // 5 minutes cache

  constructor(options: PackageTrackOptions) {
    this.validateOptions(options);
    this.repository = this.parseRepository(options.repository);
    this.branch = options.branch || "main";
    this.path = options.path || "package.json";
    this.authToken = options.authToken;
    this.timeout = options.timeout || 10000; // 10 seconds default timeout
  }

  private validateOptions(options: PackageTrackOptions): void {
    if (!options.repository) {
      throw new Error("Repository is required");
    }
    if (options.timeout && (typeof options.timeout !== 'number' || options.timeout <= 0)) {
      throw new Error("Timeout must be a positive number");
    }
  }

  private parseRepository(repo: string): string {
    if (!repo.includes("/")) {
      throw new Error("Invalid repository format. Expected format: owner/repo");
    }
    return repo
      .replace(/^https?:\/\/github\.com\//, "")
      .replace(/\.git$/, "")
      .trim();
  }

  private buildGitHubUrl(): string {
    return `https://api.github.com/repos/${this.repository}/contents/${this.path}?ref=${this.branch}`;
  }

  private getCacheKey(): string {
    return `${this.repository}:${this.branch}:${this.path}`;
  }

  private getFromCache(): PackageInfo | null {
    const cacheKey = this.getCacheKey();
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
      return cached.data;
    }
    
    return null;
  }

  private setCache(data: PackageInfo): void {
    const cacheKey = this.getCacheKey();
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
    });
  }

  async getVersion(skipCache = false): Promise<PackageInfo> {
    if (!skipCache) {
      const cached = this.getFromCache();
      if (cached) return cached;
    }

    try {
      const response = await axios.get(this.buildGitHubUrl(), {
        headers: {
          Accept: "application/vnd.github.v3.raw",
          ...(this.authToken && { Authorization: `token ${this.authToken}` }),
          "User-Agent": "PackageTrack",
        },
        timeout: this.timeout,
      });

      let packageData: PackageJSON;
      try {
        if (response.data.content) {
          const content = Buffer.from(response.data.content, "base64").toString();
          packageData = JSON.parse(content);
        } else {
          packageData = response.data;
        }
      } catch (parseError) {
        throw new Error(
          `Invalid package.json format in ${this.repository}/${this.path}: ${(parseError as Error).message}`
        );
      }

      if (!packageData.version) {
        throw new Error(
          `No version field found in ${this.repository}/${this.path}`
        );
      }

      if (!semver.valid(packageData.version)) {
        throw new Error(
          `Invalid version format: ${packageData.version}. Expected semver format.`
        );
      }

      const packageInfo: PackageInfo = {
        currentVersion: packageData.version,
        lastUpdated: new Date(),
        repository: this.repository,
        name: packageData.name,
        dependencies: packageData.dependencies,
        devDependencies: packageData.devDependencies,
      };

      this.setCache(packageInfo);
      return packageInfo;
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          throw new Error(`Request timeout after ${this.timeout}ms`);
        }
        if (error.response?.status === 404) {
          throw new Error(
            `Repository or file not found: ${this.repository} at ref "${this.branch}" and path "${this.path}"`
          );
        }
        if (error.response?.status === 403) {
          throw new Error(
            "GitHub API rate limit exceeded. Consider providing a personal access token in the options."
          );
        }
        throw new Error(
          `GitHub API error fetching ${this.repository}/${this.path}: ${
            error.response?.status
          } ${error.response?.data?.message || error.message}`
        );
      }
      throw error;
    }
  }

  async checkForUpdates(currentVersion: string): Promise<UpdateCheckResult> {
    if (!semver.valid(currentVersion)) {
      throw new Error(`Invalid current version format: ${currentVersion}`);
    }

    const { currentVersion: latestVersion } = await this.getVersion();
    const hasUpdate = semver.gt(latestVersion, currentVersion);
    
    let updateType: 'major' | 'minor' | 'patch' | undefined;
    if (hasUpdate) {
      if (semver.major(latestVersion) > semver.major(currentVersion)) {
        updateType = 'major';
      } else if (semver.minor(latestVersion) > semver.minor(currentVersion)) {
        updateType = 'minor';
      } else if (semver.patch(latestVersion) > semver.patch(currentVersion)) {
        updateType = 'patch';
      }
    }

    return {
      hasUpdate,
      latestVersion,
      currentVersion,
      updateType,
    };
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export default PackageTrack;