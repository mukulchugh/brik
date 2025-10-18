# Security Policy

## Overview

Brik is a build-time code generator that transpiles React components to native iOS and Android widgets. Security is a core design principle.

## Security Model

### Build-Time Only

**No Runtime Code Execution:**
- Brik generates static native code at build time
- No JavaScript runtime runs in widgets
- No dynamic code evaluation
- No remote code execution

**Benefits:**
- Widget code cannot be modified after build
- No injection vulnerabilities
- Minimal attack surface
- Deterministic behavior

### Code Generation

**Deterministic Codegen:**
- Same input always produces same output
- No randomness in generated code
- Fully reproducible builds
- Auditable output

**URI Validation:**
- Deep link URLs validated at build time
- Malformed URLs cause build errors
- No user-controlled URL construction in widgets
- Type-safe action definitions

### Native Sandboxing

**Platform Security:**
- Widgets run in platform sandbox (iOS/Android)
- Limited filesystem access
- No network access from widget code
- No access to sensitive APIs

**Permissions:**
- No additional permissions required
- Cannot access contacts, location, camera, etc.
- Limited to widget framework capabilities

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.2.x   | ✅ Yes (current)   |
| 0.1.x   | ⚠️ Critical fixes only |
| < 0.1.0 | ❌ No              |

We recommend always using the latest version.

## Reporting a Vulnerability

### Do NOT Open Public Issues

If you discover a security vulnerability, please **DO NOT** open a public GitHub issue.

### How to Report

**Email:** [security@brik.dev](mailto:security@brik.dev) *(coming soon)*

**For now, report via:**
- Email to project maintainers (see `package.json`)
- Privately contact via GitHub Security Advisory

### Include in Your Report

1. **Description:** What is the vulnerability?
2. **Impact:** What can an attacker do?
3. **Reproduction:** Step-by-step instructions
4. **Affected Versions:** Which versions are vulnerable?
5. **Suggested Fix:** If you have one (optional)

**Example:**
```
Subject: [SECURITY] Code injection in compiler

Description:
A malicious React component with crafted props can inject
arbitrary Swift code into generated widgets.

Impact:
An attacker who controls React source code can execute
arbitrary native code in the generated widget.

Reproduction:
1. Create component with prop: style={{ [maliciousCode]: 'value' }}
2. Run brik build
3. Observe Swift code injection in output

Affected Versions:
v0.1.0 to v0.2.0

Suggested Fix:
Sanitize all prop keys before code generation
```

### What to Expect

1. **Acknowledgment:** Within 48 hours
2. **Assessment:** Within 1 week
3. **Fix:** Critical issues within 2 weeks
4. **Disclosure:** Coordinated after fix is released

We follow responsible disclosure practices.

## Security Best Practices

### For Brik Users

**1. Validate Input Data**

Even though widgets are build-time generated, validate any data displayed:

```tsx
/** @brik */
export function MyWidget({ userName }: { userName: string }) {
  // Sanitize user input
  const safeName = userName.replace(/[<>]/g, '');

  return <BrikText>{safeName}</BrikText>;
}
```

**2. Secure Deep Links**

Validate deep link URLs in your app:

```tsx
// In your React Native app
Linking.addEventListener('url', (event) => {
  const url = event.url;

  // Validate URL scheme
  if (!url.startsWith('myapp://')) {
    console.warn('Invalid deep link');
    return;
  }

  // Parse and validate parameters
  const params = parseURL(url);
  if (!isValidParams(params)) {
    console.warn('Invalid parameters');
    return;
  }

  // Handle valid deep link
  navigate(params);
});
```

**3. Limit Widget Permissions**

Only request necessary permissions:

```tsx
// ❌ Don't do this (unnecessary permissions)
<BrikButton action={{ type: 'openApp', url: 'settings://location' }} />

// ✅ Do this (minimal permissions)
<BrikButton action={{ type: 'deeplink', url: 'myapp://profile' }} />
```

**4. Secure Live Activity Data**

Don't expose sensitive information in Live Activities:

```tsx
// ❌ Don't do this
attributes: {
  dynamic: {
    creditCardNumber: 'string',  // Sensitive!
    password: 'string',           // Never!
  }
}

// ✅ Do this
attributes: {
  dynamic: {
    status: 'string',
    progress: 'number',
  }
}
```

**5. Code Review Generated Output**

Periodically review generated Swift/Kotlin code:

```bash
# Generate code
pnpm brik build --platform ios

# Review output
cat ios/BrikActivities/*.swift

# Look for:
# - Unexpected code
# - Hardcoded secrets
# - Unusual patterns
```

**6. Keep Dependencies Updated**

```bash
# Update Brik and dependencies
pnpm update @brik/react-native @brik/cli

# Check for vulnerabilities
pnpm audit
```

**7. Use Environment Variables**

Never commit secrets to source code:

```tsx
// ❌ Don't do this
const API_KEY = 'sk_live_abc123';

// ✅ Do this
const API_KEY = process.env.API_KEY;
```

**8. Secure Server Push (v0.3.0+)**

When using server push infrastructure:

```typescript
// Validate activity IDs
if (!isValidActivityId(activityId)) {
  throw new Error('Invalid activity ID');
}

// Rate limit updates
if (isRateLimited(userId)) {
  throw new Error('Rate limit exceeded');
}

// Encrypt sensitive data
const encryptedPayload = encrypt(payload, userKey);
```

### For Contributors

**1. Input Validation**

Always validate user input:

```typescript
// ❌ Don't trust input
function generateCode(input: any) {
  return `const value = ${input};`;
}

// ✅ Validate and sanitize
function generateCode(input: unknown) {
  if (typeof input !== 'string') {
    throw new Error('Invalid input type');
  }

  const sanitized = input.replace(/['"]/g, '');
  return `const value = "${sanitized}";`;
}
```

**2. Avoid Eval and Dynamic Code**

```typescript
// ❌ Never use eval
eval(userCode);

// ❌ Avoid Function constructor
new Function(userCode)();

// ✅ Use static code generation
function generateCode(template: string, data: Record<string, string>) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    return data[key] || '';
  });
}
```

**3. Sanitize File Paths**

```typescript
// ❌ Path traversal vulnerability
const filePath = path.join(baseDir, userInput);

// ✅ Validate and sanitize
function safePath(baseDir: string, userPath: string): string {
  const resolved = path.resolve(baseDir, userPath);

  if (!resolved.startsWith(baseDir)) {
    throw new Error('Path traversal attempt detected');
  }

  return resolved;
}
```

**4. Secure Dependencies**

```bash
# Check for vulnerabilities
pnpm audit

# Update dependencies
pnpm update

# Review new dependencies
pnpm licenses list
```

**5. Code Review Checklist**

Before submitting PRs, verify:
- [ ] No hardcoded secrets or API keys
- [ ] Input validation for all user input
- [ ] No `eval()` or `Function()` usage
- [ ] File path sanitization
- [ ] Error messages don't leak sensitive info
- [ ] Dependencies are up to date
- [ ] Tests cover security edge cases

## Known Limitations

### Platform Restrictions

**iOS WidgetKit:**
- No network requests from widget code
- No background execution
- Limited to 30 MB memory
- Cannot access main app data (except via App Groups)

**Android Glance:**
- No network requests from widget code
- Limited interaction capabilities
- Cannot execute arbitrary code

**Live Activities:**
- Data exposed on lock screen (anyone can see)
- Push notifications not encrypted by default
- Limited to 4 KB payload size

### Build-Time Constraints

- Source code must be available at build time
- Cannot generate code from remote sources
- No runtime code modification

## Security Audits

### Internal Reviews

- All PRs reviewed for security issues
- Critical packages (compiler, generators) require maintainer approval
- Regular dependency audits

### External Audits

- No formal external audit yet
- Planned for v1.0.0 release
- Community security reviews welcome

## Vulnerability Disclosure

### Responsible Disclosure

We follow a 90-day disclosure timeline:

1. **Day 0:** Vulnerability reported
2. **Day 7:** Assessment and acknowledgment
3. **Day 14-30:** Fix developed and tested
4. **Day 30:** Fix released in patch version
5. **Day 90:** Public disclosure (if not already disclosed)

### CVE Assignment

For critical vulnerabilities:
- We will request CVE assignment
- Publish security advisory on GitHub
- Update documentation

### Public Disclosure

After fix is released:
- Security advisory published
- CVE details shared
- Credit given to reporter (if desired)
- Lessons learned documented

## Security Resources

### References

- [iOS Security Guide](https://support.apple.com/guide/security/welcome/web)
- [Android Security Best Practices](https://developer.android.com/topic/security/best-practices)
- [OWASP Mobile Security](https://owasp.org/www-project-mobile-security/)
- [React Native Security](https://reactnative.dev/docs/security)

### Tools

- `pnpm audit` - Check dependencies
- `npm-check-updates` - Update dependencies
- `git-secrets` - Prevent committing secrets
- `trufflehog` - Scan for secrets in git history

## Contact

- **Security Issues:** [security@brik.dev](mailto:security@brik.dev) (coming soon)
- **General Questions:** [hello@brik.dev](mailto:hello@brik.dev) (coming soon)
- **GitHub:** [github.com/brikjs/brik](https://github.com/brikjs/brik)

---

**Last Updated:** January 2025

**Brik is committed to security through design, not as an afterthought.**
