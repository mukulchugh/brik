# Maestro E2E Tests for Brik Example App

## Running Tests

### Prerequisites
- Maestro installed: `curl -Ls "https://get.maestro.mobile.dev" | bash`
- iOS Simulator or Android Emulator running
- App built and installed on device/simulator

### Run All Tests

```bash
# From this directory
maestro test flows/

# Or from project root
cd examples/brik-expo-app
maestro test .maestro/flows
```

### Run Specific Test

```bash
maestro test flows/01-smoke-test.yaml
```

### Run with Tags

```bash
# Run only smoke tests
maestro test flows/ --include-tags=smoke

# Run critical tests
maestro test flows/ --include-tags=critical

# Run iOS-only tests
maestro test flows/ --include-tags=ios-only
```

## Test Structure

```
.maestro/
├── config.yaml           # Maestro configuration
├── flows/                # Test flows
│   ├── 01-smoke-test.yaml
│   ├── 02-widget-update.yaml
│   ├── 03-live-activity.yaml
│   ├── 04-deep-linking.yaml
│   └── 05-error-handling.yaml
├── helpers/              # Reusable actions
│   └── common-actions.yaml
├── fixtures/             # Test data
│   └── widget-data.json
├── .env                  # Environment variables
└── README.md            # This file
```

## Test Flows

### 1. Smoke Test (01-smoke-test.yaml)
- Verifies app launches successfully
- Basic navigation check
- Tags: `smoke`, `critical`, `on:pr`

### 2. Widget Update (02-widget-update.yaml)
- Tests widget manager API
- Widget data updates
- Tags: `widget`, `api`, `on:pr`

### 3. Live Activity (03-live-activity.yaml)
- Full Live Activity lifecycle
- Start, update, end activity
- Tags: `live-activity`, `critical`, `ios-only`

### 4. Deep Linking (04-deep-linking.yaml)
- Deep link handling
- URL parameter parsing
- Tags: `deep-link`, `widget`

### 5. Error Handling (05-error-handling.yaml)
- Error states and edge cases
- Graceful degradation
- Tags: `error-handling`, `edge-cases`

## Adding New Tests

1. Create new YAML file in `flows/`
2. Use descriptive name: `XX-feature-name.yaml`
3. Add appropriate tags
4. Include comments for clarity
5. Take screenshots at key points

## Debugging

### View Screenshots
Screenshots are saved to: `~/.maestro/tests/<timestamp>/screenshots/`

### Run with Maestro Studio
```bash
maestro studio
```

### Enable Debug Logging
```bash
maestro test flows/ --debug
```

## CI/CD Integration

See `.github/workflows/maestro-tests.yml` for GitHub Actions integration.

## Current Status

⚠️ **Note:** These are placeholder flows for the basic Expo app template.

**TODO:**
1. Add testIDs to app components
2. Implement widget demo UI
3. Implement Live Activity demo UI
4. Update flows with actual element selectors
5. Add more comprehensive test scenarios

## Resources

- [Maestro Documentation](https://maestro.mobile.dev)
- [React Native Support](https://docs.maestro.dev/platform-support/react-native)
- [Full Test Plan](../../../docs/testing/E2E_TESTING_PLAN.md)
