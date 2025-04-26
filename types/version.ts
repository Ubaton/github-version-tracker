export interface VersionInfo {
  version: string;
  lastChecked: Date | null;
  error: string | null;
  activeBranch?: string;
  isLoading: boolean;
  hasUpdate?: boolean;
  latestVersion?: string;
  updateType?: "major" | "minor" | "patch";
}

export interface VersionDisplayProps {
  repository: string;
  branch?: string;
  path?: string;
  githubToken?: string;
  className?: string;
  refreshInterval?: number;
  onVersionChange?: (version: string) => void;
  showUpdateCheck?: boolean;
  currentVersion?: string;
  showRefreshButton?: boolean;
  showLastChecked?: boolean;
  showBranchInfo?: boolean;
  compact?: boolean;
}

export type UpdateType = "major" | "minor" | "patch";

export interface PackageTrackOptions {
  repository: string;
  branch?: string;
  path?: string;
  authToken?: string;
  timeout?: number;
}

export interface PackageJSON {
  version?: string;
  name?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

export interface PackageInfo {
  currentVersion: string;
  lastUpdated: Date;
  repository: string;
  name?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

export interface UpdateCheckResult {
  hasUpdate: boolean;
  latestVersion: string;
  currentVersion: string;
  updateType?: "major" | "minor" | "patch";
}