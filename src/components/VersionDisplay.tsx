import React, { useEffect, useState } from "react";
import { PackageTrack } from "../index";
import axios from "axios";

interface VersionDisplayProps {
  // Additional display options
  className?: string;
  refreshInterval?: number;
  repository: string;
  branch: string;
  path: string;
  githubToken?: string; // Optional GitHub token for API authentication
}

const VersionDisplay: React.FC<VersionDisplayProps> = ({
  repository,
  branch,
  path,
  className = "version-display",
  refreshInterval = 3600000,
  githubToken,
}) => {
  const [version, setVersion] = useState<string>("Loading...");
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeBranch, setActiveBranch] = useState<string>(branch);

  useEffect(() => {
    const fetchVersion = async () => {
      const tryFetch = async (branchName: string) => {
        // Configure axios for the request
        if (githubToken) {
          axios.defaults.headers.common[
            "Authorization"
          ] = `token ${githubToken}`;
        }

        const tracker = new PackageTrack({
          repository,
          branch: branchName,
          path,
        });

        const packageInfo = await tracker.getVersion();
        setVersion(packageInfo.currentVersion);
        setLastChecked(packageInfo.lastUpdated);
        setActiveBranch(branchName);
        setError(null);
      };

      try {
        await tryFetch(branch);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch version";

        // Only try fallback if it's a 404 error and we're on master branch
        if (errorMessage.includes("not found") && branch === "master") {
          try {
            await tryFetch("main");
          } catch (fallbackErr) {
            setError(
              `Failed to fetch version: ${
                fallbackErr instanceof Error
                  ? fallbackErr.message
                  : "Unknown error"
              }`
            );
          }
        } else {
          setError(errorMessage);
        }
      }
    };

    // Reset states when props change
    setVersion("Loading...");
    setError(null);
    setActiveBranch(branch);

    // Initial fetch
    fetchVersion();

    // Periodic refresh if interval is provided
    if (refreshInterval > 0) {
      const intervalId = setInterval(fetchVersion, refreshInterval);
      return () => clearInterval(intervalId);
    }
  }, [repository, branch, path, refreshInterval, githubToken]);

  if (error) {
    return <div className={`${className}__error`}>Error: {error}</div>;
  }

  return (
    <div className={className}>
      <div className={`${className}__version`}>Version: {version}</div>
      {lastChecked && (
        <div className={`${className}__timestamp`}>
          Last checked: {lastChecked.toLocaleString()}
        </div>
      )}
      {activeBranch !== branch && (
        <div className={`${className}__branch-note`}>
          Using '{activeBranch}' branch (fallback from '{branch}')
        </div>
      )}
    </div>
  );
};

export default VersionDisplay;
