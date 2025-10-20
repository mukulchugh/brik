# Mise Setup Guide for Brik

## What is Mise?

[mise](https://mise.jdx.dev/) is a modern tool version manager that replaces multiple version managers (nvm, rbenv, jenv, etc.) with a single tool. It ensures all developers use the same versions of Node.js, Java, Ruby, and other tools.

## Installation

### macOS/Linux

```bash
curl https://mise.run | sh
```

### Manual Installation

See: https://mise.jdx.dev/getting-started.html

## Quick Start

```bash
# 1. Install mise (one-time setup)
curl https://mise.run | sh

# 2. Clone Brik repository
git clone https://github.com/mukulchugh/brik.git
cd brik

# 3. Install all required tools automatically
mise install

# 4. Verify tools are installed
mise list

# 5. Run complete project setup
mise run setup
```

## Available Mise Tasks

Brik comes with pre-configured tasks for common operations:

### Setup & Installation

```bash
# Complete project setup (recommended for first-time setup)
mise run setup

# Install dependencies only
mise run install

# Build all packages
mise run build

# Build widgets
mise run widgets

# Install iOS CocoaPods
mise run pods
```

### Development

```bash
# Start individual Metro servers
mise run dev-rn-arch      # Port 8081
mise run dev-rn           # Port 8082
mise run dev-expo         # Port 8083
mise run dev-expo-arch    # Port 8084

# Show commands to run all servers
mise run dev-all
```

### Testing & Cleaning

```bash
# Run all tests
mise run test

# Clean all build artifacts
mise run clean
```

## Tool Versions

Mise automatically manages these versions (defined in `.mise.toml`):

| Tool | Version | Purpose |
|------|---------|---------|
| **Node.js** | 18.20.8 | React Native, Metro bundler, build tools |
| **Java** | zulu-17.60.17.0 | Android builds (Gradle, Android SDK) |
| **Ruby** | 3.3.5 | CocoaPods (iOS dependency manager) |
| **pnpm** | 9.6.0 | Fast package manager |

## Environment Variables

Mise automatically sets these environment variables:

- `JAVA_HOME` - Points to mise-managed Java installation
- `NODE_OPTIONS` - Set to `--max-old-space-size=4096` for large projects
- `RUBY_CONFIGURE_OPTS` - Configured for OpenSSL compatibility

You can customize environment variables by:
1. Copying `.env.example` to `.env`
2. Editing `.env` with your local settings
3. Mise will automatically load them

## Common Commands

### Check Current Tool Versions

```bash
mise current
```

Output:
```
node    18.20.8  ~/.mise.toml node 18.20.8
java    17.0.12  ~/.mise.toml java 17.0.12
ruby    3.3.5    ~/.mise.toml ruby 3.3.5
pnpm    9.6.0    ~/.mise.toml pnpm 9.6.0
```

### List All Installed Tools

```bash
mise list
```

### Update mise Itself

```bash
mise self-update
```

### Uninstall a Tool

```bash
mise uninstall node@18.20.8
```

### Install a Different Version

```bash
mise install node@20.11.0
mise use node@20.11.0
```

## Workflow Examples

### New Developer Setup

```bash
# Day 1: Clone and setup
git clone https://github.com/mukulchugh/brik.git
cd brik
curl https://mise.run | sh  # Install mise
mise install                # Install all tools
mise run setup              # Complete setup

# Start developing
mise run dev-rn-arch        # Start Metro server
```

### Daily Development

```bash
# Start working
cd brik
mise trust  # Trust .mise.toml (one-time per directory)

# Build widgets after changes
mise run widgets

# Start Metro server for specific app
mise run dev-rn-arch
```

### Before Committing

```bash
# Run tests
mise run test

# Ensure build works
mise run build
```

### Fresh Start

```bash
# Clean everything and rebuild
mise run clean
mise run setup
```

## Troubleshooting

### "mise: command not found"

Add mise to your shell:

```bash
# For bash
echo 'eval "$(~/.local/bin/mise activate bash)"' >> ~/.bashrc

# For zsh
echo 'eval "$(~/.local/bin/mise activate zsh)"' >> ~/.zshrc

# For fish
echo 'mise activate fish | source' >> ~/.config/fish/config.fish
```

Then restart your terminal.

### Tool installation fails

```bash
# Try installing individually
mise install node
mise install java
mise install ruby
mise install pnpm
```

### Wrong version being used

```bash
# Check which version is active
mise current

# Force mise to use project versions
mise trust
cd .. && cd brik  # Re-enter directory
```

### Android builds failing

Ensure `ANDROID_HOME` is set:

```bash
# Add to .env file
echo "ANDROID_HOME=$HOME/Library/Android/sdk" >> .env

# Or export in shell
export ANDROID_HOME=$HOME/Library/Android/sdk
```

### CocoaPods installation issues

```bash
# Use mise-managed Ruby
mise which ruby  # Should point to .mise/installs/ruby/...

# Reinstall pods
mise run pods
```

## Integration with IDEs

### VS Code

Add to `.vscode/settings.json`:

```json
{
  "terminal.integrated.env.osx": {
    "PATH": "${env:HOME}/.local/share/mise/shims:${env:PATH}"
  },
  "terminal.integrated.env.linux": {
    "PATH": "${env:HOME}/.local/share/mise/shims:${env:PATH}"
  }
}
```

### IntelliJ IDEA / Android Studio

1. Go to Preferences → Build, Execution, Deployment → Build Tools → Gradle
2. Set Gradle JDK to: `mise java@17.0.12`

## Comparison with Other Tools

| Feature | mise | nvm + rbenv + jenv |
|---------|------|-------------------|
| **Single tool** | ✅ | ❌ (3 separate tools) |
| **Auto-switching** | ✅ | Partial |
| **Global + local** | ✅ | ✅ |
| **Task runner** | ✅ | ❌ |
| **Env variables** | ✅ | ❌ |
| **Performance** | ⚡ Fast | Slower |

## Advanced Usage

### Custom Tasks

Edit `.mise.toml` to add your own tasks:

```toml
[tasks.my-task]
description = "My custom task"
run = """
echo "Running my task"
pnpm custom-script
"""
```

Run: `mise run my-task`

### Per-Directory Configuration

Create `.mise.local.toml` for local overrides (gitignored):

```toml
[tools]
node = "20.11.0"  # Override for this machine only
```

### Environment-Specific Settings

```toml
[env]
_.file = [".env", ".env.local"]  # Load multiple env files
```

## Resources

- Official Docs: https://mise.jdx.dev/
- GitHub: https://github.com/jdx/mise
- Discord: https://discord.gg/UBa7pJUN7Z

## Summary

mise provides:
- ✅ Consistent tool versions across all developers
- ✅ Automatic version switching per project
- ✅ Built-in task runner for common operations
- ✅ Environment variable management
- ✅ Single command setup: `mise install && mise run setup`

No more "works on my machine" issues! 🎉
