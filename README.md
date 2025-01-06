# GitHub Version Tracker

`github-version-tracker` is an NPM package that allows you to track changes to the `version` field in a `package.json` file hosted on GitHub. It simplifies fetching the current version of a package and makes it easy to display it in your frontend application.

## Features

- Fetch `version` from any `package.json` file in GitHub repositories
- Support for both `main` and `master` branches with automatic fallback
- React component for easy frontend integration
- GitHub API token support for higher rate limits
- Customizable refresh intervals
- Automatic error handling and recovery

## Installation

```bash
npm install github-version-tracker
```

or using Yarn:

```bash
yarn add github-version-tracker
```

## Usage

### Basic Usage with PackageTrack

```typescript
import PackageTrack from "github-version-tracker";

const tracker = new PackageTrack({
  repository: "username/repo",
  branch: "main",
  path: "package.json",
});

async function checkVersion() {
  try {
    const packageInfo = await tracker.getVersion();
    console.log(`Current Version: ${packageInfo.currentVersion}`);
    console.log(`Last Updated: ${packageInfo.lastUpdated}`);
    console.log(`Repository: ${packageInfo.repository}`);
  } catch (error) {
    console.error("Error:", error.message);
  }
}
```

### React Component Usage

```tsx
import { VersionDisplay } from "github-version-tracker";

// Basic usage
function App() {
  return (
    <VersionDisplay
      repository="username/repo"
      branch="main"
      path="package.json"
    />
  );
}

function App() {
  return (
    <VersionDisplay
      repository="username/repo"
      branch="main"
      path="package.json"
      className="custom-class"
      refreshInterval={3600000}
      githubToken="your-github-token"
    />
  );
}
```

## API Reference

### PackageTrack Class

#### Options

```typescript
interface PackageTrackOptions {
  repository: string;
  branch?: string;
  path?: string;
}
```

#### Methods

- **`getVersion(): Promise<PackageInfo>`**

  - Returns current version information
  - Returns: `{ currentVersion: string, lastUpdated: Date, repository: string }`

- **`checkForUpdates(currentVersion: string): Promise<{ hasUpdate: boolean, latestVersion: string }>`**
  - Checks if updates are available
  - Parameters: `currentVersion` - version to compare against

### VersionDisplay Component

#### Props

```typescript
interface VersionDisplayProps {
  repository: string;
  branch: string;
  path: string;
  className?: string;
  refreshInterval?: number;
  githubToken?: string;
}
```

## Error Handling

The package includes comprehensive error handling for common scenarios:

- Repository not found
- File not found
- Invalid package.json format
- GitHub API rate limiting
- Network errors
- Branch fallback (master → main)

## Best Practices

1. **GitHub Token**: For production use, it's recommended to provide a GitHub token to avoid rate limiting:

   ```tsx
   <VersionDisplay
     repository="username/repo"
     githubToken={process.env.GITHUB_TOKEN}
   />
   ```

2. **Refresh Interval**: Choose an appropriate refresh interval to balance freshness with API usage:
   ```tsx
   <VersionDisplay repository="username/repo" refreshInterval={3600000} />
   ```

## License

MIT License

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Contact

For any inquiries or support, please reach out to:

- **GitHub**: [Ubaton (Raymond)](https://github.com/Ubaton)
- **X**: [@\_GoldManRay](https://x.com/_GoldManRay)
