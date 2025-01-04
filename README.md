# GitHub Package Track

`github-package-track` is an NPM package that allows you to track changes to the `version` field in a `package.json` file hosted on GitHub. It simplifies fetching the current version of a package and makes it easy to display it in your frontend application.

---

## Features

- Fetch `package.json` version from public GitHub repositories.
- Cache fetched data to minimize API calls.
- Customizable cache duration.
- React component integration for frontend display.

---

## Installation

To install the package, run:

```bash
npm install package-track

```

or using Yarn:

```bash
yarn add package-track

```

---

## Usage

### Basic Usage

Here’s an example of how to use `package-track` to fetch and display the version of a GitHub repository's `package.json`:

#### Node.js

```typescript
import PackageTrack from "package-track";

const tracker = new PackageTrack();
const githubUrl = "https://github.com/yourusername/your-repo";

async function displayVersion() {
  try {
    const packageInfo = await tracker.getVersion(githubUrl);
    console.log(`Version: ${packageInfo.version}`);
    console.log(`Last Checked: ${packageInfo.lastChecked}`);
  } catch (error) {
    console.error("Error fetching version:", error.message);
  }
}

displayVersion();
```

### React Integration

You can use the `VersionDisplay` React component to show the version in your frontend:

#### Example Component

```tsx
import React from "react";
import VersionDisplay from "package-track/dist/components/VersionDisplay";

const App: React.FC = () => {
  return (
    <div>
      <h1>Package Version</h1>
      <VersionDisplay githubUrl="https://github.com/yourusername/your-repo" />
    </div>
  );
};

export default App;
```

#### Output in Frontend

```html
<div>
  <h1>Package Version</h1>
  <div class="version-display">
    <div>Version: 1.0.0</div>
    <div>Last checked: 01/02/2025, 3:00 PM</div>
  </div>
</div>
```

---

## API Reference

### PackageTrack Class

#### Constructor

```typescript
new PackageTrack(cacheTTL?: number);

```

- **`cacheTTL`** _(optional)_: Time-to-live for cached results in seconds (default: `3600`).

#### Methods

- **`getVersion(githubUrl: string): Promise<PackageInfo>`**

  - Fetch the current version from the specified GitHub repository.

- **`clearCache(githubUrl?: string): void`**

  - Clear cache for a specific URL or flush all cache.

- **`setCacheTTL(seconds: number): void`**

  - Set the cache duration.

---

## Example Workflow

1.  Install the package.
2.  Use the `PackageTrack` class to fetch and cache package versions.
3.  Integrate with React to dynamically display the version on your website.

---

## License

This project is licensed under the MIT License. See the [MIT License](https://mit-license.org/) file for details.

---

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request with your changes.

1.  Fork the repository.
2.  Create your feature branch: `git checkout -b my-new-feature`
3.  Commit your changes: `git commit -m 'Add some feature'`
4.  Push to the branch: `git push origin my-new-feature`
5.  Submit a pull request.

---

## Acknowledgments

Special thanks to the open-source community for inspiring this package!

---

## Contact

For any inquiries or support, please reach out to:

- **GitHub**: [Ubaton (Raymond)](https://github.com/Ubaton)
- **X**: [@\_GoldManRay](https://x.com/_GoldManRay)
