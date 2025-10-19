# Brik Setup & Publishing Documentation

This directory contains documentation for setting up and publishing Brik packages to npm.

## Files

- **[SETUP_COMPLETE.md](./SETUP_COMPLETE.md)** - Complete setup guide with publishing instructions
  - What was accomplished
  - Package structure summary
  - Git & monorepo strategy
  - How to publish to npm
  - Next steps and verification checklist

- **[PACKAGE_MANAGEMENT_ANALYSIS.md](./PACKAGE_MANAGEMENT_ANALYSIS.md)** - Detailed analysis and recommendations
  - Current state assessment
  - Naming conventions analysis
  - Git worktree status and recommendations
  - Package publishing readiness
  - Monorepo management strategy comparison
  - Immediate action items

## Quick Start

### Publish to npm

```bash
# 1. Create a changeset
pnpm changeset

# 2. Version packages
pnpm version-packages

# 3. Commit changes
git add . && git commit -m "chore: version packages"

# 4. Build and publish
pnpm release

# 5. Push with tags
git push --follow-tags
```

### Development

```bash
pnpm build              # Build all packages
pnpm dev                # Watch mode
pnpm test               # Run tests
pnpm typecheck          # Type check
pnpm lint               # Lint code
```

## Package Status

All 10 packages are at **v0.3.0** and ready for publishing:
- @brik/core
- @brik/compiler
- @brik/react-native
- @brik/cli
- @brik/schemas
- @brik/target-swiftui
- @brik/target-compose
- @brik/babel-plugin
- @brik/metro-plugin
- @brik/expo-plugin
