# Live Activities Backend Integration Guide

Complete guide for implementing APNs push notifications to remotely update Live Activities.

**Last Updated:** 2025-10-19
**Applies to:** Brik v0.2.0+
**Requirements:** iOS 16.1+, Apple Developer Account, Server with APNs capability

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [APNs Authentication Setup](#apns-authentication-setup)
4. [Push Token Flow](#push-token-flow)
5. [APNs Payload Structure](#apns-payload-structure)
6. [Backend Implementation Examples](#backend-implementation-examples)
7. [Testing and Debugging](#testing-and-debugging)
8. [Production Best Practices](#production-best-practices)
9. [Troubleshooting](#troubleshooting)

---

## Overview

Live Activities can be updated in two ways:

1. **Local Updates** - From your React Native app using `Brik.updateActivity()`
2. **Remote Updates** - From your backend server using APNs push notifications

Remote updates are essential for:
- Real-time updates when app is backgrounded or terminated
- Server-driven state changes (order status, delivery tracking, etc.)
- Timely notifications that don't depend on app being active

### Architecture

```
Backend Server → APNs → iOS Device → Live Activity Updates
      ↓
 Stores Push Token
 (from React Native)
```

**Data Flow:**

1. React Native app starts Live Activity
2. iOS returns push token to React Native
3. React Native sends token to your backend
4. Backend stores token with user/activity context
5. When state changes, backend sends push to APNs
6. APNs delivers to device
7. iOS updates Live Activity automatically

---

## Prerequisites

### Required Components

- **Apple Developer Account** (Individual or Organization)
- **APNs Authentication Key** or **APNs Certificate**
- **Backend server** capable of sending HTTP/2 requests
- **Brik Live Activity** already implemented in your app

### Apple Developer Portal Setup

1. **Create APNs Authentication Key** (Recommended - Token-Based)

   Navigate to: [Apple Developer Portal → Certificates, Identifiers & Profiles → Keys](https://developer.apple.com/account/resources/authkeys/list)

   - Click "+" to create new key
   - Enable "Apple Push Notifications service (APNs)"
   - Download `.p8` file (save securely - only downloadable once)
   - Note Key ID (10-character string)
   - Note Team ID (found in top-right of developer portal)

   **Advantages of Token-Based Auth:**
   - No expiration (vs certificates expire annually)
   - Works for all apps in your team
   - Simpler to manage

2. **Alternative: APNs Certificate** (Legacy Method)

   - Create App ID in developer portal
   - Enable Push Notifications capability
   - Generate APNs SSL certificate
   - Download and convert to `.pem` format

   **Not recommended** - certificates expire and require per-app setup.

---

## APNs Authentication Setup

### Token-Based Authentication (Recommended)

**What You Need:**
- Auth Key file (`.p8`)
- Key ID (10 characters, e.g., `ABC123DEFG`)
- Team ID (10 characters, e.g., `XYZ987MNOP`)

**JWT Token Generation:**

APNs requires a signed JSON Web Token (JWT) for authentication.

**Token Structure:**
```json
{
  "alg": "ES256",
  "kid": "ABC123DEFG"  // Your Key ID
}
.
{
  "iss": "XYZ987MNOP",  // Your Team ID
  "iat": 1634567890      // Current timestamp
}
.
[Signature using ES256 with your .p8 private key]
```

**Token Properties:**
- Algorithm: ES256 (ECDSA with SHA-256)
- Expiration: Can be reused for up to 60 minutes
- Header: `authorization: bearer <JWT>`

**Security Best Practices:**
- Never commit `.p8` file to version control
- Store in environment variables or secrets manager
- Rotate tokens hourly in production
- Use separate keys for dev/staging/prod if possible

---

## Push Token Flow

### 1. Starting a Live Activity

```typescript
import { Brik } from '@brik/react-native';

// Start Live Activity
const result = await Brik.startActivity({
  activityType: 'OrderTracking',
  attributes: {
    static: { orderId: '12345', merchantName: 'Acme Pizza' },
    dynamic: { status: 'preparing', eta: 30, progress: 0.1 }
  }
});

// result contains:
// {
//   id: "<push-token-hex-string>",  // Use this for remote updates
//   activityType: "OrderTracking"
// }

console.log('Activity started with push token:', result.id);
```

### 2. Sending Push Token to Your Backend

```typescript
// Send to your backend API
await fetch('https://your-api.com/activities/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: currentUserId,
    activityType: 'OrderTracacking',
    orderId: '12345',
    pushToken: result.id,  // APNs push token
    platform: 'ios'
  })
});
```

### 3. Backend Storage

Store push token with context for later updates:

```javascript
// Example database schema
{
  userId: 'user_123',
  activityType: 'OrderTracking',
  orderId: '12345',
  pushToken: 'a1b2c3d4e5f6...',
  createdAt: '2025-10-19T10:00:00Z',
  status: 'active'
}
```

**Important:** Push tokens can change, so update on each activity start.

---

## APNs Payload Structure

### Payload Requirements

APNs requires a specific JSON structure for Live Activities updates.

### Update Event

```json
{
  "aps": {
    "timestamp": 1698765432,
    "event": "update",
    "content-state": {
      "status": "out_for_delivery",
      "eta": 10,
      "progress": 0.8
    },
    "alert": {
      "title": "Order Update",
      "body": "Your order is out for delivery!"
    }
  }
}
```

### End Event

```json
{
  "aps": {
    "timestamp": 1698765432,
    "event": "end",
    "dismissal-date": 1698769032,
    "content-state": {
      "status": "delivered",
      "eta": 0,
      "progress": 1.0
    }
  }
}
```

### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `timestamp` | number | Yes | Unix timestamp (seconds since epoch) - must be within 1-10 seconds of current time |
| `event` | string | Yes | "update" or "end" |
| `content-state` | object | Yes | Dynamic attributes matching your ActivityAttributes.ContentState |
| `dismissal-date` | number | No | Unix timestamp when to dismiss (for "end" event) |
| `alert` | object | No | Optional banner notification |
| `sound` | string | No | Sound filename (e.g., "default") |
| `priority` | number | No | 10 (immediate) or 5 (power-efficient) |

---

## Backend Implementation Examples

### Node.js with `apn` Library

**Installation:**
```bash
pnpm add apn jsonwebtoken
```

**Implementation:**
```javascript
const apn = require('apn');
const jwt = require('jsonwebtoken');
const fs = require('fs');

// Load APNs Auth Key
const authKey = fs.readFileSync('./AuthKey_ABC123DEFG.p8', 'utf8');

// APNs Provider Configuration
const apnProvider = new apn.Provider({
  token: {
    key: authKey,
    keyId: 'ABC123DEFG',     // Your Key ID
    teamId: 'XYZ987MNOP',    // Your Team ID
  },
  production: true,  // false for development
});

/**
 * Update Live Activity
 * @param {string} pushToken - Push token from Brik.startActivity()
 * @param {string} bundleId - Your app's bundle identifier
 * @param {object} contentState - Dynamic attributes to update
 */
async function updateLiveActivity(pushToken, bundleId, contentState) {
  const notification = new apn.Notification();

  // APNs Configuration
  notification.topic = `${bundleId}.push-type.liveactivity`;
  notification.pushType = 'liveactivity';
  notification.priority = 10;  // 10 = immediate, 5 = power-conserving
  notification.payload = {
    aps: {
      timestamp: Math.floor(Date.now() / 1000),
      event: 'update',
      'content-state': contentState,
      alert: {
        title: 'Order Update',
        body: `Status: ${contentState.status}`,
      },
    },
  };

  // Send to APNs
  const result = await apnProvider.send(notification, pushToken);

  if (result.failed.length > 0) {
    console.error('APNs Error:', result.failed[0].response);
    throw new Error(`APNs push failed: ${result.failed[0].response.reason}`);
  }

  console.log('Live Activity updated successfully');
  return result;
}

/**
 * End Live Activity
 */
async function endLiveActivity(pushToken, bundleId, finalContentState) {
  const notification = new apn.Notification();

  notification.topic = `${bundleId}.push-type.liveactivity`;
  notification.pushType = 'liveactivity';
  notification.priority = 5;  // Lower priority for end events
  notification.payload = {
    aps: {
      timestamp: Math.floor(Date.now() / 1000),
      event: 'end',
      'dismissal-date': Math.floor(Date.now() / 1000) + 3600,  // Dismiss in 1 hour
      'content-state': finalContentState,
    },
  };

  return await apnProvider.send(notification, pushToken);
}

// Example Usage
updateLiveActivity(
  'a1b2c3d4e5f6...',  // Push token from device
  'com.example.myapp',
  {
    status: 'delivering',
    eta: 5,
    progress: 0.9,
  }
);
```

### Python with `aioapns`

**Installation:**
```bash
pip install aioapns
```

**Implementation:**
```python
import asyncio
import time
from aioapns import APNs, NotificationRequest, PushType

# Initialize APNs client
apns = APNs(
    key='/path/to/AuthKey_ABC123DEFG.p8',
    key_id='ABC123DEFG',
    team_id='XYZ987MNOP',
    topic='com.example.myapp.push-type.liveactivity',
    use_sandbox=False,  # True for development
)

async def update_live_activity(push_token: str, content_state: dict):
    """Update Live Activity with new state"""

    request = NotificationRequest(
        device_token=push_token,
        message={
            'aps': {
                'timestamp': int(time.time()),
                'event': 'update',
                'content-state': content_state,
                'alert': {
                    'title': 'Order Update',
                    'body': f"Status: {content_state['status']}"
                }
            }
        },
        push_type=PushType.LIVEACTIVITY,
        priority=10,
    )

    response = await apns.send_notification(request)

    if response.is_successful:
        print('Live Activity updated successfully')
    else:
        print(f'Error: {response.description}')

    return response

# Example Usage
asyncio.run(update_live_activity(
    'a1b2c3d4e5f6...',
    {
        'status': 'delivering',
        'eta': 5,
        'progress': 0.9
    }
))
```

### cURL Example (Testing)

```bash
# Generate JWT token first (use online tool or script)
# Then send push:

curl -v \
  --http2 \
  --header "authorization: bearer YOUR_JWT_TOKEN" \
  --header "apns-topic: com.example.myapp.push-type.liveactivity" \
  --header "apns-push-type: liveactivity" \
  --header "apns-priority: 10" \
  --data '{
    "aps": {
      "timestamp": 1698765432,
      "event": "update",
      "content-state": {
        "status": "delivering",
        "eta": 5,
        "progress": 0.9
      }
    }
  }' \
  https://api.push.apple.com:443/3/device/PUSH_TOKEN_HERE
```

**Production APNs:** `https://api.push.apple.com:443`
**Development APNs:** `https://api.sandbox.push.apple.com:443`

---

## Testing and Debugging

### Apple Push Notification Console

Use Apple's web-based testing tool: [https://icloud.com/pushnotificationconsole](https://icloud.com/pushnotificationconsole)

**Steps:**
1. Log in with Apple Developer account
2. Select your app's bundle identifier
3. Paste device push token
4. Select "Live Activity" notification type
5. Compose JSON payload
6. Send test push

**Advantages:**
- No backend code required for testing
- Immediate feedback
- Validates APNs connectivity

### Console.app Monitoring (macOS)

**View APNs logs:**
1. Open Console.app on your Mac
2. Connect iPhone via USB
3. Select device in sidebar
4. Filter for "apns" or "activity"
5. Watch for APNs delivery and errors

**Common Log Messages:**
- "Received push notification for activity" - ✅ Success
- "Push notification delivery failed" - ❌ Error
- "Activity update budget exceeded" - ⚠️ Too many updates

### Xcode Console

**Enable push notification logging:**
1. Run app from Xcode
2. Start Live Activity
3. Send push from backend
4. Check Console output for APNs logs

---

## Production Best Practices

### Priority Management

APNs has a **daily budget** for Live Activity updates:

- **Budget:** ~200-250 pushes per day per device
- **Priority 10 (immediate):** Counts toward budget
- **Priority 5 (power-efficient):** May not count, but delayed delivery

**Recommendations:**
- Use priority 10 for critical updates (e.g., "out for delivery")
- Use priority 5 for periodic updates (e.g., ETA countdowns)
- Batch updates when possible (send every 5 minutes, not every second)

### Timestamp Accuracy

APNs **rejects pushes with old timestamps**:

- Must be within **1-10 seconds** of current time
- Server clock must be synchronized (use NTP)
- Generate timestamp immediately before sending

**Validation:**
```javascript
const timestamp = Math.floor(Date.now() / 1000);
const now = Math.floor(Date.now() / 1000);

if (Math.abs(now - timestamp) > 10) {
  console.warn('Timestamp too old, regenerating');
  timestamp = now;
}
```

### Error Handling

**APNs Error Responses:**

| Status Code | Reason | Action |
|-------------|--------|--------|
| 200 | Success | Continue |
| 400 | BadDeviceToken | Remove token from database |
| 403 | BadCertificate | Check auth key/certificate |
| 410 | Unregistered | Device uninstalled app, remove token |
| 429 | TooManyRequests | Implement exponential backoff |
| 500 | InternalServerError | Retry after delay |

**Retry Logic:**
```javascript
async function sendWithRetry(notification, token, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await apnProvider.send(notification, token);

      if (result.sent.length > 0) {
        return result;  // Success
      }

      const error = result.failed[0];

      if (error.status === 410 || error.status === 400) {
        // Permanent failure, don't retry
        console.error('Permanent error:', error.response.reason);
        // Remove token from database
        await deleteToken(token);
        return null;
      }

      // Transient error, retry with backoff
      const delay = Math.pow(2, i) * 1000;  // 1s, 2s, 4s
      await new Promise(resolve => setTimeout(resolve, delay));

    } catch (err) {
      console.error(`Attempt ${i + 1} failed:`, err);
      if (i === maxRetries - 1) throw err;
    }
  }
}
```

### Rate Limiting

Implement rate limiting to prevent budget exhaustion:

```javascript
const rateLimiter = new Map();

function canSendUpdate(activityId) {
  const lastSent = rateLimiter.get(activityId);
  const now = Date.now();

  if (!lastSent || now - lastSent > 60000) {  // Max 1 per minute
    rateLimiter.set(activityId, now);
    return true;
  }

  return false;
}
```

### Monitoring and Alerts

**Key Metrics to Track:**
- APNs success rate (target: >99%)
- Average push latency (target: <2 seconds)
- Daily push count per device (stay below 200)
- Error rate by type (400, 403, 410, etc.)

**Alerting Thresholds:**
- Error rate >5% - Investigate immediately
- 410 errors spiking - App update may have invalidated tokens
- 429 errors - Reduce send rate

---

## Troubleshooting

### Push Not Received

**Checklist:**

1. **Verify push token is correct**
   ```javascript
   console.log('Token length:', pushToken.length);  // Should be 64 hex chars
   console.log('Token format:', /^[0-9a-f]{64}$/i.test(pushToken));  // Should be true
   ```

2. **Check APNs topic format**
   - Correct: `com.example.myapp.push-type.liveactivity`
   - Incorrect: `com.example.myapp` (missing suffix)

3. **Verify push type**
   - Must be `liveactivity` (lowercase)
   - NOT `alert` or other types

4. **Validate timestamp**
   - Must be current Unix time in seconds
   - Must be within 10 seconds of now

5. **Check content-state matches ActivityAttributes**
   - Field names must match exactly (case-sensitive)
   - Types must match (string, number, boolean)

### "BadDeviceToken" Error

**Causes:**
- Push token format incorrect (not 64 hex chars)
- Activity has ended (tokens become invalid)
- App was deleted and reinstalled (new token generated)

**Solution:**
- Request new push token by starting new activity
- Update token in database

### "Unregistered" Error (410)

**Cause:** Device uninstalled app or token expired

**Solution:**
- Remove token from database
- Don't retry
- User must reinstall app to get new token

### Budget Exceeded

**Symptoms:**
- Console.app shows "budget exceeded" messages
- Pushes delayed by 15+ minutes
- Some pushes never delivered

**Solutions:**
- Reduce update frequency (max 1 per minute)
- Use priority 5 for non-critical updates
- Implement smart batching (combine multiple state changes)

### Content Not Updating

**Cause:** content-state doesn't match ActivityAttributes.ContentState

**Solution:**
```swift
// Verify your generated ActivityAttributes:
public struct OrderTrackingContentState: Codable, Hashable {
    var status: String   // ← Must match JSON key exactly
    var eta: Int         // ← Must be Int, not Double
    var progress: Double // ← Must be Double, not Int
}
```

```json
// Payload must match exactly:
{
  "aps": {
    "content-state": {
      "status": "delivering",  // ← String
      "eta": 5,                 // ← Int
      "progress": 0.9           // ← Double
    }
  }
}
```

---

## Complete Example: Order Tracking

### React Native (Frontend)

```typescript
import { Brik } from '@brik/react-native';

export async function startOrderTracking(orderId: string) {
  try {
    // Start Live Activity
    const activity = await Brik.startActivity({
      activityType: 'OrderTracking',
      attributes: {
        static: {
          orderId: orderId,
          merchantName: 'Acme Pizza'
        },
        dynamic: {
          status: 'preparing',
          eta: 30,
          progress: 0.1
        }
      }
    });

    console.log('Activity started:', activity.id);

    // Register with backend
    await fetch('https://api.example.com/orders/activity/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        orderId: orderId,
        pushToken: activity.id,
        platform: 'ios'
      })
    });

    return activity;

  } catch (error) {
    console.error('Failed to start activity:', error);
    throw error;
  }
}
```

### Backend (Node.js)

```javascript
const express = require('express');
const apn = require('apn');
const app = express();

// APNs Provider
const apnProvider = new apn.Provider({
  token: {
    key: process.env.APNS_KEY,
    keyId: process.env.APNS_KEY_ID,
    teamId: process.env.APNS_TEAM_ID,
  },
  production: true,
});

// Database (simplified)
const activities = new Map();

// Register Live Activity
app.post('/orders/activity/register', async (req, res) => {
  const { orderId, pushToken, platform } = req.body;

  activities.set(orderId, {
    pushToken,
    platform,
    status: 'preparing',
    createdAt: Date.now()
  });

  res.json({ success: true });
});

// Update Order Status (called by your order system)
app.post('/orders/:orderId/status', async (req, res) => {
  const { orderId } = req.params;
  const { status, eta } = req.body;

  const activity = activities.get(orderId);
  if (!activity || activity.platform !== 'ios') {
    return res.json({ success: false, message: 'No iOS activity found' });
  }

  // Calculate progress
  const progress = {
    'preparing': 0.2,
    'ready': 0.4,
    'picked_up': 0.6,
    'delivering': 0.8,
    'delivered': 1.0
  }[status] || 0.1;

  // Send push notification
  const notification = new apn.Notification();
  notification.topic = 'com.example.myapp.push-type.liveactivity';
  notification.pushType = 'liveactivity';
  notification.priority = status === 'delivering' ? 10 : 5;
  notification.payload = {
    aps: {
      timestamp: Math.floor(Date.now() / 1000),
      event: status === 'delivered' ? 'end' : 'update',
      'content-state': {
        status,
        eta,
        progress
      },
      alert: {
        title: 'Order Update',
        body: `Your order is ${status.replace('_', ' ')}`
      }
    }
  };

  const result = await apnProvider.send(notification, activity.pushToken);

  if (result.sent.length > 0) {
    activity.status = status;
    res.json({ success: true, message: 'Live Activity updated' });
  } else {
    res.status(500).json({ success: false, error: result.failed[0].response });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));
```

---

## Next Steps

1. **Implement backend endpoint** to receive push tokens
2. **Set up APNs authentication** (get .p8 key from Apple Developer Portal)
3. **Test with Apple Push Notification Console** before implementing backend
4. **Monitor APNs logs** in Console.app during development
5. **Implement error handling and retry logic** in production
6. **Set up monitoring** for push success rates and errors

---

## Additional Resources

- [Apple Developer: Updating and ending Live Activities with push notifications](https://developer.apple.com/documentation/activitykit/updating-and-ending-your-live-activity-with-activitykit-push-notifications)
- [Apple Developer: Sending notification requests to APNs](https://developer.apple.com/documentation/usernotifications/sending-notification-requests-to-apns)
- [APNs Provider API Reference](https://developer.apple.com/documentation/usernotifications/setting_up_a_remote_notification_server)
- [Apple Push Notification Console](https://icloud.com/pushnotificationconsole)

---

**Need Help?**
- GitHub Issues: [https://github.com/brikjs/brik/issues](https://github.com/brikjs/brik/issues)
- Documentation: [https://github.com/brikjs/brik/tree/main/docs](https://github.com/brikjs/brik/tree/main/docs)
