# Contributing to Brik

Thank you for your interest in contributing to Brik! This guide will help you get started.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Making Changes](#making-changes)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Coding Guidelines](#coding-guidelines)
- [Documentation](#documentation)
- [Community](#community)

## Code of Conduct

We are committed to providing a welcoming and inclusive environment for all contributors. Please be respectful, constructive, and professional in all interactions.

**Expected Behavior:**
- Be respectful and inclusive
- Welcome newcomers
- Focus on what is best for the community
- Show empathy towards others

**Unacceptable Behavior:**
- Harassment or discrimination
- Trolling or insulting comments
- Publishing others' private information
- Other conduct inappropriate in a professional setting

Report violations to [conduct@brik.dev](mailto:conduct@brik.dev) (coming soon).

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm 8+
- Git
- Basic knowledge of TypeScript and React
- Familiarity with React Native (for widget development)
- Optional: Xcode (for iOS testing), Android Studio (for Android testing)

### Find an Issue

1. Check [GitHub Issues](https://github.com/brikjs/brik/issues)
2. Look for issues labeled `good first issue` or `help wanted`
3. Comment on the issue to express interest
4. Wait for maintainer approval before starting work

### Report a Bug

Found a bug? Please open an issue with:

1. **Title:** Clear, descriptive summary
2. **Description:** What happened vs. what you expected
3. **Steps to Reproduce:** Minimal reproducible example
4. **Environment:** OS, Node version, Brik version, etc.
5. **Screenshots/Logs:** If applicable

**Template:**
```markdown
**Bug Description:**
[Clear description]

**Steps to Reproduce:**
1. [First step]
2. [Second step]
3. [And so on...]

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happens]

**Environment:**
- OS: [e.g., macOS 14.0]
- Node: [e.g., v18.17.0]
- Brik: [e.g., v0.2.0]
- Platform: [iOS/Android/both]

**Additional Context:**
[Logs, screenshots, etc.]
```

### Request a Feature

Have an idea? Open a feature request with:

1. **Problem Statement:** What problem does this solve?
2. **Proposed Solution:** How would it work?
3. **Alternatives Considered:** Other approaches you've thought about
4. **Use Cases:** Real-world scenarios where this helps

## Development Setup

### 1. Fork and Clone

```bash
# Fork the repository on GitHub, then:
git clone https://github.com/YOUR_USERNAME/brik.git
cd brik
```

### 2. Install Dependencies

```bash
pnpm install
```

This installs dependencies for all packages in the monorepo.

### 3. Build All Packages

```bash
pnpm -w build
```

This builds all packages in dependency order.

### 4. Run Tests

```bash
pnpm test
```

### 5. Verify Setup

```bash
# Check that CLI works
cd packages/brik-cli
pnpm link --global
brik --version

# Run doctor command
brik doctor
```

## Project Structure

```
brik/
├── packages/
│   ├── brik-core/              # Core types and utilities
│   ├── brik-schemas/           # Zod validation schemas
│   ├── brik-compiler/          # JSX → IR compiler
│   ├── brik-target-swiftui/    # SwiftUI code generator
│   ├── brik-target-compose/    # Glance/Compose generator
│   ├── brik-cli/               # Command-line interface
│   ├── brik-react-native/      # React Native components + native modules
│   ├── brik-expo-plugin/       # Expo config plugin
│   ├── brik-babel-plugin/      # Babel plugin
│   ├── brik-metro-plugin/      # Metro bundler plugin
│   └── brik-test-utils/        # Shared test utilities
├── examples/
│   └── rn-expo-app/            # Example React Native app
├── docs/                        # Documentation
├── CHANGELOG.md
├── CONTRIBUTING.md
└── README.md
```

### Package Responsibilities

- **brik-core**: IR type definitions, utilities
- **brik-schemas**: Zod schemas for IR validation
- **brik-compiler**: Babel parser, AST traversal, IR building
- **brik-target-swiftui**: SwiftUI code generation (iOS)
- **brik-target-compose**: Glance code generation (Android)
- **brik-cli**: CLI commands (scan, build, doctor, clean, etc.)
- **brik-react-native**: Brik components, Live Activities API, native modules
- **brik-expo-plugin**: Expo integration
- **brik-babel-plugin**: Babel transform
- **brik-metro-plugin**: Metro integration
- **brik-test-utils**: Test helpers

## Making Changes

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

**Branch Naming:**
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test improvements

### 2. Make Your Changes

- Write clear, concise code
- Follow existing code style
- Add comments for complex logic
- Update tests as needed
- Update documentation if applicable

### 3. Test Your Changes

```bash
# Run all tests
pnpm test

# Run tests for specific package
cd packages/brik-compiler
pnpm test

# Run linter
pnpm lint

# Build all packages
pnpm -w build
```

### 4. Test End-to-End

```bash
# Build CLI
cd packages/brik-cli
pnpm build

# Test in example app
cd ../../examples/rn-expo-app
pnpm brik build --platform all

# Verify generated files look correct
```

### 5. Commit Your Changes

```bash
git add .
git commit -m "feat: add new component BrikGauge"
```

**Commit Message Format:**

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting, missing semicolons, etc.
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(compiler): add support for animations
fix(swiftui): correct color conversion for #ARGB
docs(readme): update installation instructions
refactor(cli): simplify file scanning logic
test(schemas): add IR validation tests
```

## Submitting Changes

### 1. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 2. Create a Pull Request

1. Go to [github.com/brikjs/brik](https://github.com/brikjs/brik)
2. Click "New Pull Request"
3. Select your fork and branch
4. Fill out the PR template

**PR Template:**

```markdown
## Description
[Describe what this PR does]

## Motivation
[Why is this change needed?]

## Changes Made
- [Change 1]
- [Change 2]
- [Change 3]

## Testing
- [ ] All tests pass
- [ ] Added new tests for changes
- [ ] Tested manually on iOS
- [ ] Tested manually on Android
- [ ] Updated documentation

## Screenshots (if applicable)
[Add screenshots or videos]

## Breaking Changes
[List any breaking changes, or write "None"]

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests added/updated
- [ ] All tests passing
```

### 3. Code Review

- Maintainers will review your PR
- Address feedback in new commits
- Keep discussion respectful and constructive
- Be patient - reviews take time

### 4. Merging

Once approved:
- Maintainers will merge your PR
- Your changes will be included in the next release
- You'll be credited in the changelog

## Coding Guidelines

### TypeScript

- Use TypeScript for all new code
- Prefer interfaces over types for objects
- Use strict type checking
- Avoid `any` - use `unknown` if type is truly unknown
- Document complex types with JSDoc comments

**Example:**
```typescript
/**
 * Converts a React style object to IR style properties
 * @param style - React Native style object
 * @returns Normalized IR style properties
 */
function parseStyle(style: Record<string, any>): StyleProps {
  // Implementation
}
```

### Code Style

- Use 2 spaces for indentation
- Use single quotes for strings
- Use semicolons
- Use trailing commas in objects/arrays
- Max line length: 100 characters
- Use descriptive variable names

**Naming Conventions:**
- Variables/functions: `camelCase`
- Classes/types: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`
- Private fields: `_prefixedCamelCase`

### Error Handling

- Throw descriptive errors
- Use custom error classes when appropriate
- Log errors with context
- Provide helpful error messages

**Example:**
```typescript
if (!node.type) {
  throw new Error(
    `Invalid IR node: missing 'type' field. Node ID: ${node.id}`
  );
}
```

### Comments

- Write self-documenting code
- Use comments for "why", not "what"
- Document public APIs with JSDoc
- Add TODO comments for future work

**Example:**
```typescript
// TODO: Add support for gradients in v0.6.0
// See issue #123
```

## Testing

### Test Structure

```typescript
import { describe, it, expect } from 'vitest';

describe('ComponentName', () => {
  describe('methodName', () => {
    it('should handle normal case', () => {
      expect(result).toBe(expected);
    });

    it('should handle edge case', () => {
      expect(result).toBe(expected);
    });

    it('should throw error for invalid input', () => {
      expect(() => fn()).toThrow();
    });
  });
});
```

### Coverage

- Aim for 80%+ coverage for new code
- Test edge cases and error conditions
- Test both success and failure paths
- Mock external dependencies

### Integration Tests

When adding major features:
1. Create test fixture in `examples/`
2. Run full compilation pipeline
3. Verify generated code
4. Test on real devices if possible

## Documentation

### Code Documentation

- Document all public APIs with JSDoc
- Include parameter descriptions
- Include return type descriptions
- Add usage examples for complex APIs

### User Documentation

When adding features, update:
- `README.md` - If it affects installation/quickstart
- `docs/GETTING_STARTED.md` - For user-facing features
- `docs/ARCHITECTURE.md` - For architectural changes
- `docs/IR_SPEC.md` - For IR changes
- `docs/MAPPINGS.md` - For new component/style mappings

### Examples

Add examples for new features:
- Update `examples/rn-expo-app/` with new component usage
- Add to `docs/STYLING_AND_ACTIONS.md` if relevant
- Consider creating a dedicated example file

## Community

### Communication Channels

- **GitHub Issues**: Bug reports, feature requests
- **GitHub Discussions**: Questions, ideas, showcases
- **Discord**: Real-time chat (link coming soon)
- **Twitter**: Updates and announcements [@brikjs](https://twitter.com/brikjs) (coming soon)

### Getting Help

- Read the documentation first
- Search existing issues/discussions
- Ask in Discord or GitHub Discussions
- Tag maintainers only if urgent

### Recognition

Contributors will be:
- Listed in `CHANGELOG.md`
- Credited in release notes
- Added to `CONTRIBUTORS.md` (coming soon)
- Thanked on social media

## Release Process

(For maintainers)

1. Update `CHANGELOG.md`
2. Bump version in all `package.json` files
3. Build all packages: `pnpm -w build`
4. Run tests: `pnpm test`
5. Commit: `chore: release v0.x.0`
6. Tag: `git tag v0.x.0`
7. Push: `git push && git push --tags`
8. Publish: `pnpm -r publish --access public`
9. Create GitHub release with changelog

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

## Questions?

- Open a [GitHub Discussion](https://github.com/brikjs/brik/discussions)
- Email: [hello@brik.dev](mailto:hello@brik.dev) (coming soon)

**Thank you for contributing to Brik!** 🎉
