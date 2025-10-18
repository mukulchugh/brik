# Brik Roadmap

This document outlines the development roadmap for Brik from the current v0.2.0 to v1.0.0 and beyond.

## Current Version: v0.2.0 ✅

**Released:** January 2025

**Features:**
- Complete widget transpilation system (React → SwiftUI/Glance)
- iOS Live Activities with ActivityKit integration
- Dynamic Island support (compact, minimal, expanded)
- Lock screen widgets (iOS 16+)
- Home screen widgets (iOS 14+, Android 12+)
- Native module bridge for iOS
- JavaScript API for activity lifecycle
- 8 core UI components with 60+ style properties
- Actions and deep linking
- Comprehensive documentation
- Working examples

## Short Term (v0.2.x - Next 1-2 Months)

### v0.2.1 - Bug Fixes & Polish

**Target:** February 2025

**Focus:**
- Fix any community-reported bugs
- Improve error messages in compiler
- Add more comprehensive test coverage
- Optimize bundle sizes
- Performance improvements

**Tasks:**
- [ ] Test on physical iOS devices (iPhone 14 Pro+, iOS 16.1+)
- [ ] Test on physical Android devices (Android 12+)
- [ ] Fix test infrastructure (Jest/Vitest)
- [ ] Add integration tests
- [ ] Set up CI/CD pipeline
- [ ] Add error tracking (Sentry or similar)

### v0.2.2 - Developer Experience

**Target:** March 2025

**Focus:**
- Enhanced CLI commands
- Better debugging tools
- Improved documentation

**Tasks:**
- [ ] Add widget preview command
- [ ] Improve `brik doctor` diagnostics
- [ ] Add `brik validate` for IR validation
- [ ] Create video tutorials
- [ ] Write blog posts/guides
- [ ] Expand example gallery

## Medium Term (v0.3.0-0.5.0 - Next 3-6 Months)

### v0.3.0 - Server Push Infrastructure

**Target:** April-May 2025

**Focus:** Remote updates for widgets and Live Activities

**Features:**

**1. Push Token Management**
- APNs token registration and refresh
- FCM token registration (Android)
- Token storage and synchronization
- Automatic token updates

**2. @brik/server Package**

New server-side SDK for widget/activity updates:

```typescript
import { BrikServer } from '@brik/server';

const server = new BrikServer({
  apns: {
    keyId: process.env.APNS_KEY_ID,
    teamId: process.env.APNS_TEAM_ID,
    key: process.env.APNS_KEY,
  },
  fcm: {
    serverKey: process.env.FCM_SERVER_KEY,
  },
});

// Update Live Activity remotely
await server.updateActivity(activityId, {
  dynamic: { status: 'delivering', eta: 5 }
});

// Update widget data
await server.updateWidget(userId, widgetData);
```

**3. Infrastructure**
- Redis for message queue
- PostgreSQL/DynamoDB for state storage
- APNs gateway service
- FCM gateway service
- WebSocket for development mode
- Rate limiting and retry logic

**4. Security**
- End-to-end encryption
- Token rotation
- Activity ID obfuscation
- Per-device rate limiting

**Tasks:**
- [ ] Design server architecture
- [ ] Implement APNs integration
- [ ] Implement FCM integration
- [ ] Create @brik/server package
- [ ] Add authentication/authorization
- [ ] Deploy infrastructure
- [ ] Write server documentation

**Acceptance Criteria:**
- Can update Live Activities from server
- Can update widget data remotely
- Secure token management
- Handles rate limiting gracefully

---

### v0.4.0 - watchOS Support

**Target:** June 2025

**Focus:** Apple Watch widgets and complications

**Features:**

**1. watchOS Widget Generation**
- Watch App target creation
- WidgetKit for watchOS
- Complications support (circular, rectangular, inline)
- Smart Stack integration

**2. New Widget Families**
- `accessoryCircular` (lock screen/watch)
- `accessoryRectangular` (lock screen/watch)
- `accessoryInline` (lock screen/watch)

**3. Watch-Specific Components**
- BrikGauge - Circular progress
- BrikRing - Ring progress indicators
- Compact layouts optimized for watch

**Example:**
```tsx
/** @brik-widget */
export function WatchWidget() {
  return (
    <BrikView style={{ padding: 4 }}>
      <BrikGauge progress={0.75} label="Steps" />
    </BrikView>
  );
}
```

**Tasks:**
- [ ] Add watchOS target to CLI
- [ ] Create watch-specific components
- [ ] Implement complication generation
- [ ] Add watch preview components
- [ ] Update documentation
- [ ] Create watch examples

**Acceptance Criteria:**
- Can generate watchOS widgets
- Complications render correctly
- Smart Stack integration works
- All widget families supported

---

### v0.5.0 - Enhanced Developer Experience

**Target:** July 2025

**Focus:** Tools and debugging enhancements

**Features:**

**1. Hot Reload for Widgets**
- File watcher for source changes
- WebSocket server for live updates
- Automatic widget refresh in simulator
- Real-time IR preview

**2. Widget Preview App**
- Standalone iOS/Android app for widget testing
- All widget families/sizes preview
- Light/dark mode toggle
- Dynamic data injection

**3. IR Visualizer Web UI**
- Interactive IR tree viewer
- Style inspector
- Node highlighting
- Export/import IR

**4. Timeline Debugger**
- Visualize widget update timeline
- Test different refresh policies
- Simulate time-based updates

**5. Push Notification Tester**
- Test APNs/FCM locally
- Simulate remote updates
- Activity state inspector

**6. Enhanced CLI**
- `brik preview` - Launch preview app
- `brik watch` - Hot reload mode
- `brik visualize` - Open IR visualizer
- `brik test-push` - Test push notifications

**Tasks:**
- [ ] Implement hot reload system
- [ ] Create preview apps (iOS/Android)
- [ ] Build IR visualizer web app
- [ ] Add timeline debugger
- [ ] Create push tester tool
- [ ] Enhanced CLI commands

**Acceptance Criteria:**
- Hot reload works in <1s
- Preview app shows all widget variants
- IR visualizer is interactive
- Push tester validates notifications

---

## Long Term (v1.0.0 - 6-12 Months)

### v1.0.0 - Production Release

**Target:** December 2025

**Focus:** Stability, performance, and ecosystem

**Goals:**
- Production-ready codebase
- Comprehensive test coverage (>80%)
- Deployed push infrastructure
- Large community adoption
- Commercial support options

**Features:**

**1. Complete Platform Support**
- ✅ iOS Home Screen (WidgetKit)
- ✅ iOS Lock Screen (WidgetKit)
- ✅ iOS Live Activities (ActivityKit)
- ✅ iOS Dynamic Island
- ✅ Android Home Screen (Glance)
- ✅ watchOS Widgets
- 🆕 iPad Lock Screen widgets
- 🆕 macOS widgets (WidgetKit)
- 🔮 Android Lock Screen (if API available)

**2. Advanced Features**
- Animations and transitions
- Gestures (limited by platform)
- Advanced layouts (grid, masonry)
- Charts and graphs components
- Custom fonts support
- Gradient backgrounds
- Image caching and optimization

**3. Widget Builder (Visual Editor)**
- Drag-and-drop widget designer
- Live preview
- Style editor
- Export to React code
- Template marketplace

**4. Widget Marketplace**
- Pre-built widget templates
- Community contributions
- One-click installation
- Rating and reviews

**5. Enterprise Features**
- Commercial support
- SLA guarantees
- Priority bug fixes
- Custom feature development
- Training and workshops

**Tasks:**
- [ ] Achieve 80%+ test coverage
- [ ] Complete all platform support
- [ ] Build visual editor
- [ ] Launch widget marketplace
- [ ] Establish commercial support
- [ ] Create certification program

**Success Metrics:**
- 2000+ GitHub stars
- 2000+ npm downloads/week
- 100+ production apps using Brik
- 50+ community contributions
- Commercial partnerships

---

## Future (v2.0.0+)

### Potential Features

**1. Web Widgets**
- Progressive Web App widgets
- Chrome/Edge sidebar widgets
- Desktop web notifications

**2. Cross-Platform Widgets**
- Linux desktop widgets
- Windows desktop widgets
- Browser extensions

**3. Advanced Components**
- Maps integration
- WebView support (where allowed)
- Camera/media components
- Sensor data visualization

**4. AI-Powered Features**
- AI widget generator from description
- Smart layout optimization
- Automatic responsive design
- Performance suggestions

**5. Backend Integration**
- Official backend service (BaaS)
- GraphQL/REST API generation
- Real-time data sync
- Analytics dashboard

## Community Roadmap

### Immediate
- [x] GitHub repository published
- [ ] Discord/Slack community
- [ ] GitHub Discussions enabled
- [ ] Twitter/X account
- [ ] Reddit presence

### Short Term
- [ ] Blog post/tutorial series
- [ ] Submit to React Native Newsletter
- [ ] Video walkthroughs
- [ ] Partnership with RN libraries
- [ ] Conference talks

### Medium Term
- [ ] Workshops and webinars
- [ ] Hackathons
- [ ] Widget design contests
- [ ] Contributor recognition program

### Long Term
- [ ] Annual Brik conference
- [ ] Certification program
- [ ] Educational partnerships
- [ ] Open source grants

## Technical Debt & Infrastructure

### High Priority
- [ ] Comprehensive test suite
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Error tracking (Sentry)
- [ ] Performance benchmarks
- [ ] Security audits

### Medium Priority
- [ ] Enhanced metro plugin
- [ ] Expanded babel plugin
- [ ] Migration guides
- [ ] Automated releases

### Low Priority
- [ ] ESLint configuration
- [ ] Prettier setup
- [ ] Changelog automation
- [ ] Dependency updates

## Decision Points

### Immediate Decisions Needed
- ✅ Publish v0.2.0 to npm - **YES** (ready)
- 🤔 Start v0.3.0 (server push) OR v0.4.0 (watchOS)?
- 🤔 Build in-house push infrastructure OR partner with existing service?
- 🤔 Open source everything OR offer commercial features?

### Recommended Path
1. Publish v0.2.0 immediately
2. Build community while developing v0.3.0
3. Parallel: watchOS (v0.4.0) + DX improvements (v0.5.0)
4. Launch v1.0.0 with full platform support + marketplace

## Contributing to the Roadmap

We welcome community input on the roadmap:

1. **Suggest Features:** Open a GitHub Discussion or Issue
2. **Vote on Features:** React to existing issues with 👍
3. **Contribute Code:** See [CONTRIBUTING.md](./CONTRIBUTING.md)
4. **Sponsor Development:** GitHub Sponsors (coming soon)

## Stay Updated

- **GitHub:** Watch releases on [github.com/brikjs/brik](https://github.com/brikjs/brik)
- **Twitter:** Follow [@brikjs](https://twitter.com/brikjs) (coming soon)
- **Discord:** Join our community (link coming soon)
- **Newsletter:** Subscribe at [brik.dev](https://brik.dev) (coming soon)

---

*Last updated: January 2025*
