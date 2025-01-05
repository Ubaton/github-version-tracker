import React, { useEffect, useState } from "react";
import { PackageTrack } from "../index";

interface VersionDisplayProps {
  // Additional display options
  className?: string;
  refreshInterval?: number;
  repository: string;
  branch: string;
  path: string;
}

const VersionDisplay: React.FC<VersionDisplayProps> = ({
  repository,
  branch,
  path,
  className = "version-display",
  refreshInterval = 3600000,
}) => {
  const [version, setVersion] = useState<string>("Loading...");
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const tracker = new PackageTrack({ repository, branch, path });

    const fetchVersion = async () => {
      try {
        const packageInfo = await tracker.getVersion();
        setVersion(packageInfo.currentVersion);
        setLastChecked(packageInfo.lastUpdated);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch version"
        );
      }
    };

    // Initial fetch
    fetchVersion();

    // periodic refresh if interval is provided
    if (refreshInterval > 0) {
      const intervalId = setInterval(fetchVersion, refreshInterval);
      return () => clearInterval(intervalId);
    }
  }, [repository, branch, path, refreshInterval]);

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
    </div>
  );
};

export default VersionDisplay;
