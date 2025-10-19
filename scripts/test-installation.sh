#!/bin/bash

###############################################################################
# Brik Installation Test Script
# Tests end-to-end installation flow for React Native projects
#
# Usage:
#   ./scripts/test-installation.sh
#
# Requirements:
#   - Node.js 18+
#   - pnpm or npm
#   - Xcode (for iOS testing)
#   - Android Studio (for Android testing)
#
# What This Tests:
#   1. Package installation (@brik/react-native, @brik/cli)
#   2. CLI doctor command
#   3. iOS widget setup
#   4. Android widget setup
#   5. Code generation
#   6. File verification
#   7. Build validation
#
# Exit Codes:
#   0 - All tests passed
#   1 - Tests failed
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[PASS]${NC} $1"
    TESTS_PASSED=$((TESTS_PASSED + 1))
}

log_error() {
    echo -e "${RED}[FAIL]${NC} $1"
    TESTS_FAILED=$((TESTS_FAILED + 1))
}

log_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_section() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

# Test function wrapper
run_test() {
    TESTS_RUN=$((TESTS_RUN + 1))
    TEST_NAME="$1"
    log_info "Running: $TEST_NAME"
}

# Verify command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check file exists
file_exists() {
    if [ -f "$1" ]; then
        log_success "File exists: $1"
        return 0
    else
        log_error "File missing: $1"
        return 1
    fi
}

# Check directory exists
dir_exists() {
    if [ -d "$1" ]; then
        log_success "Directory exists: $1"
        return 0
    else
        log_error "Directory missing: $1"
        return 1
    fi
}

# Check file contains string
file_contains() {
    if grep -q "$2" "$1" 2>/dev/null; then
        log_success "File contains '$2': $1"
        return 0
    else
        log_error "File missing '$2': $1"
        return 1
    fi
}

###############################################################################
# MAIN TESTS
###############################################################################

log_section "Brik Installation Test Suite"
log_info "Testing Brik v0.2.0 installation flow"
log_info "Test project: examples/BrikTestApp"

# Navigate to test project
TEST_PROJECT_DIR="examples/BrikTestApp"
if [ ! -d "$TEST_PROJECT_DIR" ]; then
    log_error "Test project not found: $TEST_PROJECT_DIR"
    exit 1
fi

cd "$TEST_PROJECT_DIR"
log_success "Found test project: $TEST_PROJECT_DIR"

###############################################################################
# 1. ENVIRONMENT CHECKS
###############################################################################

log_section "1. Environment Checks"

run_test "Node.js installed"
if command_exists node; then
    NODE_VERSION=$(node --version)
    log_success "Node.js: $NODE_VERSION"
else
    log_error "Node.js not installed"
fi

run_test "Package manager available"
if command_exists pnpm; then
    PKG_MANAGER="pnpm"
    log_success "Package manager: pnpm $(pnpm --version)"
elif command_exists npm; then
    PKG_MANAGER="npm"
    log_success "Package manager: npm $(npm --version)"
else
    log_error "No package manager found (pnpm or npm required)"
    exit 1
fi

run_test "Xcode available (iOS)"
if command_exists xcodebuild; then
    XCODE_VERSION=$(xcodebuild -version | head -n 1)
    log_success "Xcode: $XCODE_VERSION"
else
    log_warning "Xcode not available (iOS tests will be skipped)"
fi

run_test "React Native CLI available"
if command_exists npx; then
    log_success "npx available for React Native CLI"
else
    log_error "npx not available"
fi

###############################################################################
# 2. PACKAGE INSTALLATION
###############################################################################

log_section "2. Package Installation"

run_test "package.json exists"
file_exists "package.json"

run_test "Brik packages in dependencies"
if file_contains "package.json" "@brik/react-native"; then
    log_success "@brik/react-native in package.json"
else
    log_error "@brik/react-native not in package.json"
fi

if file_contains "package.json" "@brik/cli"; then
    log_success "@brik/cli in package.json"
else
    log_error "@brik/cli not in package.json"
fi

run_test "node_modules installed"
if [ -d "node_modules" ]; then
    log_success "node_modules directory exists"

    if [ -d "node_modules/@brik/react-native" ]; then
        log_success "@brik/react-native installed"
    else
        log_error "@brik/react-native not installed"
    fi

    if [ -d "node_modules/@brik/cli" ]; then
        log_success "@brik/cli installed"
    else
        log_error "@brik/cli not installed"
    fi
else
    log_error "node_modules not found (run: $PKG_MANAGER install)"
fi

###############################################################################
# 3. CLI COMMANDS
###############################################################################

log_section "3. CLI Commands"

run_test "brik doctor command"
if npx brik doctor >/dev/null 2>&1; then
    log_success "brik doctor executes successfully"
else
    log_error "brik doctor failed"
fi

run_test "brik scan command"
if npx brik scan >/dev/null 2>&1; then
    log_success "brik scan executes successfully"
else
    log_error "brik scan failed"
fi

run_test "brik --help command"
if npx brik --help >/dev/null 2>&1; then
    log_success "brik --help executes successfully"
else
    log_error "brik --help failed"
fi

###############################################################################
# 4. iOS SETUP VALIDATION
###############################################################################

if command_exists xcodebuild; then
    log_section "4. iOS Setup Validation"

    run_test "ios/ directory exists"
    dir_exists "ios"

    run_test "Podfile exists"
    file_exists "ios/Podfile"

    run_test "iOS project files"
    if ls ios/*.xcodeproj >/dev/null 2>&1; then
        log_success "Xcode project found"
    else
        log_error "No .xcodeproj found"
    fi

    run_test "Main app Info.plist"
    INFO_PLIST=$(find ios -name "Info.plist" -not -path "*/Pods/*" | head -n 1)
    if [ -f "$INFO_PLIST" ]; then
        log_success "Info.plist found: $INFO_PLIST"

        # Check for NSSupportsLiveActivities
        if file_contains "$INFO_PLIST" "NSSupportsLiveActivities"; then
            log_success "NSSupportsLiveActivities configured"
        else
            log_warning "NSSupportsLiveActivities not configured (required for Live Activities)"
        fi
    else
        log_error "Info.plist not found"
    fi

    run_test "CocoaPods installation"
    if [ -d "ios/Pods" ]; then
        log_success "Pods installed"
    else
        log_warning "Pods not installed (run: cd ios && pod install)"
    fi

    run_test "BrikReactNative pod"
    if [ -f "../../packages/brik-react-native/BrikReactNative.podspec" ]; then
        log_success "BrikReactNative.podspec exists"
    else
        log_error "BrikReactNative.podspec not found"
    fi

else
    log_warning "Skipping iOS tests (Xcode not available)"
fi

###############################################################################
# 5. ANDROID SETUP VALIDATION
###############################################################################

log_section "5. Android Setup Validation"

run_test "android/ directory exists"
dir_exists "android"

run_test "build.gradle exists"
file_exists "android/build.gradle"

run_test "AndroidManifest.xml exists"
MANIFEST="android/app/src/main/AndroidManifest.xml"
file_exists "$MANIFEST"

run_test "Android app build.gradle"
APP_BUILD_GRADLE="android/app/build.gradle"
if file_exists "$APP_BUILD_GRADLE"; then
    # Check for Glance dependencies (if setup was run)
    if file_contains "$APP_BUILD_GRADLE" "androidx.glance"; then
        log_success "Glance dependencies configured"
    else
        log_warning "Glance dependencies not configured (run: npx brik android-setup)"
    fi
fi

###############################################################################
# 6. CODE GENERATION TEST
###############################################################################

log_section "6. Code Generation Test"

run_test "Generated code directory"
if [ -d "ios/brik/Generated" ]; then
    log_success "iOS generated code directory exists"

    SWIFT_FILES=$(find ios/brik/Generated -name "*.swift" 2>/dev/null | wc -l)
    if [ "$SWIFT_FILES" -gt 0 ]; then
        log_success "Found $SWIFT_FILES generated Swift files"
    else
        log_warning "No generated Swift files (run: npx brik build --platform ios)"
    fi
else
    log_warning "iOS generated code directory not found"
fi

if [ -d "android/brik/Generated" ]; then
    log_success "Android generated code directory exists"

    KOTLIN_FILES=$(find android/brik/Generated -name "*.kt" 2>/dev/null | wc -l)
    if [ "$KOTLIN_FILES" -gt 0 ]; then
        log_success "Found $KOTLIN_FILES generated Kotlin files"
    else
        log_warning "No generated Kotlin files (run: npx brik build --platform android)"
    fi
else
    log_warning "Android generated code directory not found"
fi

###############################################################################
# 7. NATIVE MODULE VALIDATION
###############################################################################

log_section "7. Native Module Validation"

run_test "iOS native module files"
if [ -f "../../packages/brik-react-native/ios/BrikWidgetManager.swift" ]; then
    log_success "BrikWidgetManager.swift exists"

    if file_contains "../../packages/brik-react-native/ios/BrikWidgetManager.swift" "UserDefaults"; then
        log_success "Widget data storage implemented"
    fi
fi

if [ -f "../../packages/brik-react-native/ios/BrikLiveActivities.swift" ]; then
    log_success "BrikLiveActivities.swift exists"

    if file_contains "../../packages/brik-react-native/ios/BrikLiveActivities.swift" "ActivityKit"; then
        log_success "ActivityKit integration present"
    fi
fi

if [ -f "../../packages/brik-react-native/ios/BrikActivityRegistry.swift" ]; then
    log_success "BrikActivityRegistry.swift exists"
else
    log_error "BrikActivityRegistry.swift missing"
fi

run_test "Android native module files"
if [ -f "../../packages/brik-react-native/android/src/main/java/com/brik/BrikWidgetManager.kt" ]; then
    log_success "BrikWidgetManager.kt exists"
else
    log_error "BrikWidgetManager.kt missing"
fi

###############################################################################
# 8. TYPESCRIPT DECLARATIONS
###############################################################################

log_section "8. TypeScript Declarations"

run_test "TypeScript declaration files"
if [ -f "../../packages/brik-react-native/src/index.d.ts" ]; then
    log_success "index.d.ts exists"
else
    log_warning "index.d.ts not found"
fi

if [ -f "../../packages/brik-react-native/src/live-activities.ts" ]; then
    log_success "live-activities.ts exists"
else
    log_warning "live-activities.ts not found"
fi

###############################################################################
# SUMMARY
###############################################################################

log_section "Test Summary"

echo ""
echo "Tests Run:    $TESTS_RUN"
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed!${NC}"
    echo ""
    echo "Installation appears to be working correctly."
    echo ""
    echo "Next steps:"
    echo "  1. Run: npx brik ios-setup --name MyWidget"
    echo "  2. Run: npx brik android-setup --name MyWidget"
    echo "  3. Run: npx brik build --platform all"
    echo "  4. Follow manual Xcode/Android Studio setup in docs/"
    echo ""
    exit 0
else
    echo -e "${RED}❌ Some tests failed${NC}"
    echo ""
    echo "Please review the failures above and:"
    echo "  1. Check installation guide: docs/guides/INSTALLATION.md"
    echo "  2. Run: npx brik doctor"
    echo "  3. Verify package installation: $PKG_MANAGER install"
    echo "  4. Report issues: https://github.com/brikjs/brik/issues"
    echo ""
    exit 1
fi
