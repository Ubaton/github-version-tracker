import React, { useEffect, useState, useCallback, useMemo } from "react";
import { PackageTrack } from "../index";
import { AlertCircle, Clock, GitBranch, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Button } from "../components/ui/button";
import { Tooltip } from "../components/ui/tooltip";

interface VersionInfo {
  version: string;
  lastChecked: Date | null;
  error: string | null;
  activeBranch: string;
  isLoading: boolean;
  hasUpdate?: boolean;
  latestVersion?: string;
  updateType?: "major" | "minor" | "patch";
}

interface VersionDisplayProps {
  repository: string;
  branch: string;
  path: string;
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

const DEFAULT_REFRESH_INTERVAL = 3600000; // 1 hour
const FALLBACK_BRANCHES = ["master", "main", "develop"];

export const VersionDisplay: React.FC<VersionDisplayProps> = ({
  repository,
  branch,
  path,
  githubToken,
  className = "version-display",
  refreshInterval = DEFAULT_REFRESH_INTERVAL,
  onVersionChange,
  showUpdateCheck = false,
  currentVersion,
  showRefreshButton = true,
  showLastChecked = true,
  showBranchInfo = true,
  compact = false,
}) => {
  const [versionInfo, setVersionInfo] = useState<VersionInfo>({
    version: "Loading...",
    lastChecked: null,
    error: null,
    activeBranch: branch,
    isLoading: true,
  });

  const tracker = useMemo(
    () =>
      new PackageTrack({
        repository,
        branch,
        path,
        authToken: githubToken,
      }),
    [repository, branch, path, githubToken]
  );

  const fetchVersion = useCallback(async () => {
    setVersionInfo((prev) => ({ ...prev, isLoading: true, error: null }));

    const tryFetchWithBranch = async (branchName: string) => {
      try {
        const packageInfo = await tracker.getVersion();
        let updateInfo = undefined;

        if (showUpdateCheck && currentVersion) {
          updateInfo = await tracker.checkForUpdates(currentVersion);
        }

        setVersionInfo({
          version: packageInfo.currentVersion,
          lastChecked: packageInfo.lastUpdated,
          activeBranch: branchName,
          error: null,
          isLoading: false,
          hasUpdate: updateInfo?.hasUpdate,
          latestVersion: updateInfo?.latestVersion,
          updateType: updateInfo?.updateType,
        });

        onVersionChange?.(packageInfo.currentVersion);
        return true;
      } catch (error) {
        return false;
      }
    };

    try {
      // Try the specified branch first
      if (await tryFetchWithBranch(branch)) return;

      // Try fallback branches if the main one fails
      for (const fallbackBranch of FALLBACK_BRANCHES) {
        if (
          fallbackBranch !== branch &&
          (await tryFetchWithBranch(fallbackBranch))
        )
          return;
      }

      // If all attempts fail, set error
      throw new Error(`Unable to fetch version from any branch`);
    } catch (err) {
      setVersionInfo((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : "Unknown error occurred",
        isLoading: false,
      }));
    }
  }, [tracker, branch, showUpdateCheck, currentVersion, onVersionChange]);

  useEffect(() => {
    fetchVersion();

    if (refreshInterval > 0) {
      const intervalId = setInterval(fetchVersion, refreshInterval);
      return () => clearInterval(intervalId);
    }
  }, [fetchVersion, refreshInterval]);

  const renderUpdateStatus = () => {
    if (!showUpdateCheck || !versionInfo.hasUpdate) return null;

    const updateTypeColors = {
      major: "text-red-500",
      minor: "text-yellow-500",
      patch: "text-green-500",
    };

    return (
      <div className={`${className}__update mt-2`}>
        <span className={updateTypeColors[versionInfo.updateType || "patch"]}>
          {`Update available: ${versionInfo.latestVersion} `}
          {versionInfo.updateType && `(${versionInfo.updateType} update)`}
        </span>
      </div>
    );
  };

  if (versionInfo.error) {
    return (
      <Alert variant="destructive" className="mt-2">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{versionInfo.error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={`${className} ${compact ? "text-sm" : ""}`}>
      <div className="flex items-center gap-2">
        <div className={`${className}__version flex-grow`}>
          Version: {versionInfo.isLoading ? "Loading..." : versionInfo.version}
        </div>
        {showRefreshButton && (
          <Tooltip
          //  content="Refresh version"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchVersion}
              disabled={versionInfo.isLoading}
              className="p-1"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  versionInfo.isLoading ? "animate-spin" : ""
                }`}
              />
            </Button>
          </Tooltip>
        )}
      </div>

      {renderUpdateStatus()}

      {!compact && (
        <>
          {showLastChecked && versionInfo.lastChecked && (
            <div
              className={`${className}__timestamp mt-1 text-sm text-gray-500 flex items-center gap-1`}
            >
              <Clock className="h-3 w-3" />
              {versionInfo.lastChecked.toLocaleString()}
            </div>
          )}

          {showBranchInfo && versionInfo.activeBranch !== branch && (
            <div
              className={`${className}__branch-note mt-1 text-sm text-gray-500 flex items-center gap-1`}
            >
              <GitBranch className="h-3 w-3" />
              Using '{versionInfo.activeBranch}' (fallback from '{branch}')
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default VersionDisplay;
