# Brik Package Management Analysis & Recommendations

## Current State Assessment

### 1. Examples Folder Issues

**Problems:**
- **3 example apps** instead of 1:
  - `bare-rn-app/` - Empty (only README, 4KB)
  - `rn-expo-app/` - Partially working Expo app (1.3MB)
  - `BrikTestApp/` - Full React Native app (293MB with node_modules)
- **Loose file** at root: `examples/WidgetExampleComponent.tsx`
- **Naming inconsistency**: `BrikTestApp` (PascalCase) vs `rn-expo-app` (kebab-case)

**Recommendation:**
- **Keep:** `BrikTestApp` → Rename to `brik-example-app`
- **Remove:** `bare-rn-app`, `rn-expo-app`, `WidgetExampleComponent.tsx`
- **Reason:** BrikTestApp is the only fully functional bare React Native example

### 2. Naming Conventions Analysis

**Current State:**
✅ **Packages:** All properly kebab-cased
- `@brik/react-native`
- `@brik/expo-plugin`
- `@brik/cli`, etc.

✅ **Source Files:** All kebab-case
- `live-activities.ts`
- `widget-manager.ts`
- `ios-widget-setup.ts`

❌ **Examples:** Inconsistent
- `BrikTestApp/` → Should be `brik-example-app/`
- `App.tsx` → Fine (React convention)
- `OrderTrackingActivity.tsx` → Fine (component name)

**Recommendation:** Rename `BrikTestApp` to `brik-example-app`

### 3. Git Worktree Status

**Current State:**
```
/Users/mukulchugh/Work/Products/brik  0f66e0a [main]
```
- No active worktrees
- Previous worktrees removed correctly
- Single monorepo structure

**Problem:** You mentioned "each package should have its own git" - This is **ANTI-PATTERN** for monorepos!

### 4. Package Publishing Readiness

**Packages to Publish (10 total):**

| Package | Version | Private | Status |
|---------|---------|---------|--------|
| `@brik/schemas` | 0.2.0 | ❌ false | Ready |
| `@brik/core` | 0.3.0 | ❌ false | Ready |
| `@brik/compiler` | 0.2.0 | ❌ false | Ready |
| `@brik/target-swiftui` | 0.2.0 | ❌ false | Ready |
| `@brik/target-compose` | 0.2.0 | ❌ false | Ready |
| `@brik/react-native` | 0.3.0 | ❌ false | Ready |
| `@brik/cli` | 0.2.0 | ❌ false | Ready |
| `@brik/babel-plugin` | 0.2.0 | ❌ false | Ready |
| `@brik/metro-plugin` | 0.2.0 | ❌ false | Ready |
| `@brik/expo-plugin` | 0.2.0 | ❌ false | Ready |
| `@brik/test-utils` | 0.1.0 | ✅ true | Internal only |

**Version Mismatches:**
- `@brik/core`: 0.3.0 (needs sync)
- `@brik/react-native`: 0.3.0 (needs sync)
- All others: 0.2.0

---

## Recommended Monorepo Management Strategy

### Option A: Single Git Repo with pnpm Workspaces (RECOMMENDED)

**Why This is Best:**
1. ✅ Atomic commits across packages
2. ✅ Simplified dependency management
3. ✅ Single source of truth
4. ✅ Industry standard (Turborepo, Nx, Rush, Lerna)
5. ✅ Your current setup already uses this!

**Structure:**
```
brik/
├── .git/                    # Single git repo
├── packages/
│   ├── brik-core/
│   ├── brik-react-native/
│   ├── brik-cli/
│   └── ... (10 packages)
├── examples/
│   └── brik-example-app/   # Single clean example
├── pnpm-workspace.yaml
├── package.json
└── turbo.json
```

**Publishing Strategy:**
- Use **Changesets** or **Lerna** for versioning
- Publish to npm as independent packages
- Each package gets its own npm page
- Users install: `npm install @brik/react-native @brik/cli`

**Git Workflow:**
```bash
# Feature development
git checkout -b feature/new-widget-api
# Make changes across multiple packages
git add packages/brik-core packages/brik-react-native
git commit -m "feat: add new widget API"
git push origin feature/new-widget-api

# No worktrees needed for normal development
```

**When to Use Git Worktrees:**
- Working on 2+ branches simultaneously
- Long-running feature + hotfix
- Not for package isolation!

---

### Option B: Git Submodules (NOT RECOMMENDED)

**Problems:**
1. ❌ Complex to maintain
2. ❌ Difficult for contributors
3. ❌ Version sync nightmares
4. ❌ CI/CD complexity
5. ❌ Against monorepo philosophy

**Only Use If:**
- Packages have different release cycles
- Different teams own different packages
- Need separate permissions

---

### Option C: Multi-Repo (WORST for Your Case)

**Why Not:**
1. ❌ Breaks shared dependencies
2. ❌ Duplicate tooling config
3. ❌ Cross-package changes = multiple PRs
4. ❌ Version sync hell

---

## Recommended Publishing Setup

### Step 1: Install Changesets

```bash
pnpm add -D -w @changesets/cli
pnpm changeset init
```

### Step 2: Configure `.changeset/config.json`

```json
{
  "$schema": "https://unpkg.com/@changesets/config@3.0.0/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "fixed": [],
  "linked": [],
  "access": "public",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": ["@brik/test-utils"]
}
```

### Step 3: Update Root `package.json`

```json
{
  "scripts": {
    "changeset": "changeset",
    "version-packages": "changeset version",
    "release": "pnpm build && changeset publish"
  }
}
```

### Step 4: Add `.npmignore` to Each Package

```
# packages/brik-core/.npmignore
src/
tsconfig.json
*.test.ts
__tests__/
.babelrc
```

### Step 5: Update `package.json` for Each Package

**Example: `packages/brik-core/package.json`**

```json
{
  "name": "@brik/core",
  "version": "0.3.0",
  "description": "Core compiler and type system for Brik",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.js"
    }
  },
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ],
  "publishConfig": {
    "access": "public"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/mukulchugh/brik.git",
    "directory": "packages/brik-core"
  },
  "keywords": [
    "react-native",
    "widgets",
    "swiftui",
    "jetpack-compose",
    "compiler"
  ],
  "author": "Mukul Chugh",
  "license": "MIT"
}
```

### Step 6: CI/CD for Publishing

**GitHub Actions `.github/workflows/release.yml`:**

```yaml
name: Release

on:
  push:
    branches:
      - main

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          registry-url: 'https://registry.npmjs.org'

      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - run: pnpm test

      - name: Create Release Pull Request or Publish
        uses: changesets/action@v1
        with:
          publish: pnpm release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

---

## Immediate Action Items

### 1. Clean Up Examples
```bash
# Remove unused examples
rm -rf examples/bare-rn-app examples/rn-expo-app
rm examples/WidgetExampleComponent.tsx

# Rename BrikTestApp
mv examples/BrikTestApp examples/brik-example-app

# Update package.json name
# Edit examples/brik-example-app/package.json
```

### 2. Sync Package Versions
```bash
# Decide on unified version (0.3.0 or 1.0.0)
# Update all package.json files to match
```

### 3. Add Missing Package Metadata
For each package in `packages/*/package.json`, add:
- `description`
- `keywords`
- `repository.directory`
- `files` array
- `exports` field
- `publishConfig`

### 4. Setup Changesets
```bash
pnpm add -D -w @changesets/cli
pnpm changeset init
```

### 5. Test Local Publishing
```bash
# Build all packages
pnpm build

# Test pack (doesn't publish)
cd packages/brik-core
npm pack
# Check generated tarball

# Test in external project
cd ~/test-project
npm install /path/to/brik/packages/brik-core/brik-core-0.3.0.tgz
```

---

## Why NOT Multiple Git Repos

**Your packages are tightly coupled:**
- `@brik/react-native` depends on `@brik/core`
- `@brik/cli` depends on `@brik/compiler`
- `@brik/compiler` depends on `@brik/target-swiftui` & `@brik/target-compose`

**If separated:**
1. Change to core → Update 5 dependent packages
2. Each update = separate PR
3. Version sync across repos
4. Can't test cross-package changes atomically
5. Contributor nightmare

**Industry Examples (Monorepos):**
- React: 40+ packages, single repo
- Babel: 140+ packages, single repo
- Next.js: 20+ packages, single repo
- Turborepo: 10+ packages, single repo

---

## Git Worktree Usage (When Needed)

**Good Use Cases:**
```bash
# Hotfix while working on feature
git worktree add ../brik-hotfix hotfix/critical-bug

# Review PR while working
git worktree add ../brik-review pr-branch

# Multiple long-running features
git worktree add ../brik-feature-2 feature/widget-v2
```

**NOT For:**
- ❌ Package isolation
- ❌ Default development
- ❌ "Each package needs its own git"

---

## Summary

### Current Issues:
1. ✅ **Naming:** Mostly correct, rename `BrikTestApp` → `brik-example-app`
2. ❌ **Examples:** 3 apps, should be 1
3. ✅ **Git:** Single repo is CORRECT
4. ⚠️ **Publishing:** Not configured yet

### Next Steps:
1. Clean examples folder (remove 2, rename 1)
2. Install Changesets
3. Add package metadata
4. Sync versions
5. Test local publishing
6. Setup GitHub Actions
7. Publish to npm

### DO NOT:
- ❌ Create separate git repos per package
- ❌ Use git worktrees for package management
- ❌ Use git submodules

### DO:
- ✅ Keep single monorepo
- ✅ Use pnpm workspaces (current setup)
- ✅ Use Changesets for versioning
- ✅ Publish to npm as scoped packages (@brik/*)
- ✅ Use Turborepo for builds (already setup)

Your current setup is **90% correct**. Just need publishing config and cleanup!
