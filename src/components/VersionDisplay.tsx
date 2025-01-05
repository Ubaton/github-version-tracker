// import React, { useEffect, useState } from "react";
// import { PackageTrack } from "github-version-tracker";

// interface VersionDisplayProps {
//   githubUrl: string;
//   cacheTTL?: number;
// }

// const VersionDisplay: React.FC<VersionDisplayProps> = ({
//   githubUrl,
//   cacheTTL = 3600,
// }) => {
//   const [version, setVersion] = useState<string>("Loading...");
//   const [lastChecked, setLastChecked] = useState<string>("");
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const tracker = new PackageTrack(cacheTTL);

//     const fetchVersion = async () => {
//       try {
//         const packageInfo = await tracker.getVersion(githubUrl);
//         setVersion(packageInfo.version);
//         setLastChecked(new Date(packageInfo.lastChecked).toLocaleString());
//       } catch (err: any) {
//         setError(err.message);
//       }
//     };

//     fetchVersion();
//   }, [githubUrl, cacheTTL]);

//   if (error) {
//     return <div>Error fetching version: {error}</div>;
//   }

//   return (
//     <div className="version-display">
//       <div>Version: {version}</div>
//       {lastChecked && <div>Last checked: {lastChecked}</div>}
//     </div>
//   );
// };

// export default VersionDisplay;
