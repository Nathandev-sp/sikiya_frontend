# Push Notifications Setup - Complete ✅

## What Was Set Up

### Frontend (Already Configured)
- ✅ `expo-notifications` and `expo-device` packages installed
- ✅ `notificationService.js` created with all necessary functions
- ✅ `app.json` configured with `expo-notifications` plugin
- ✅ `App.js` integrated with notification service
- ✅ Project ID configured: `960ca8c8-7e44-4e44-9c92-f52c3fc09da2`

### Backend (Just Added)
- ✅ Added `pushToken` and `pushTokenPlatform` fields to `User_login` model
- ✅ Created `POST /user/push-token` endpoint to register push tokens
- ✅ Created `DELETE /user/push-token` endpoint to remove tokens on logout

## How It Works

### 1. Token Registration Flow
1. User logs in → App calls `initializePushNotifications()`
2. App requests notification permissions from user
3. App gets Expo Push Token from Expo servers
4. App sends token to backend: `POST /user/push-token`
5. Backend stores token in `User_login` model

### 2. Sending Notifications (Backend)

To send a notification to a user, you'll need to:

1. **Get user's push token from database:**
```javascript
const user = await User_login.findById(userId);
const pushToken = user.pushToken;
```

2. **Send notification via Expo Push API:**
```javascript
const axios = require('axios');

const response = await axios.post('https://exp.host/--/api/v2/push/send', {
  to: pushToken,
  title: 'Notification Title',
  body: 'Notification message',
  data: {
    // Custom data for deep linking
    articleId: '123',
    type: 'new_article'
  },
  sound: 'default',
  priority: 'high',
});
```

### 3. Receiving Notifications (Frontend)

The app already has listeners set up in `App.js`:
- **Foreground notifications**: When app is open
- **Notification taps**: When user taps a notification

You can customize the handlers in `App.js` to navigate to specific screens based on notification data.

## Testing

### Test on Physical Device
Push notifications **only work on physical devices**, not simulators/emulators.

1. Build and install app on a physical device
2. Log in to the app
3. Grant notification permissions when prompted
4. Check backend logs to confirm token was saved
5. Send a test notification from backend

### Test Notification Endpoint (Backend)

You can create a test endpoint to send notifications:

```javascript
// In your backend routes
router.post('/test/notification', requireAuth, async (req, res) => {
  try {
    const user = await User_login.findById(req.user._id);
    
    if (!user.pushToken) {
      return res.status(400).json({ error: 'No push token registered' });
    }

    const axios = require('axios');
    const response = await axios.post('https://exp.host/--/api/v2/push/send', {
      to: user.pushToken,
      title: 'Test Notification',
      body: 'This is a test notification from Sikiya!',
      data: { type: 'test' },
      sound: 'default',
    });

    res.json({ success: true, result: response.data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## Next Steps

1. **Create notification service in backend** to send notifications for:
   - New article published
   - New comment on user's article
   - New follower
   - etc.

2. **Add notification preferences** - Let users choose what notifications they want

3. **Handle notification navigation** - Update `handleNotificationTapped` in `App.js` to navigate to specific screens

## Important Notes

- ⚠️ Push notifications require a **physical device** (not simulator/emulator)
- ⚠️ For **production builds**, you'll need to configure:
  - iOS: APNs certificates (see `PRODUCTION_PUSH_NOTIFICATIONS.md`)
  - Android: FCM credentials (see `PRODUCTION_PUSH_NOTIFICATIONS.md`)
- ✅ For **development builds**, Expo handles everything automatically

## Files Modified

### Backend
- `src/models/User_login.js` - Added pushToken fields
- `src/routes/userRoutes.js` - Added push token endpoints

### Frontend
- `src/services/notificationService.js` - Updated to use projectId from app.json
- `App.js` - Already integrated (no changes needed)

## API Endpoints

### Register Push Token
```
POST /user/push-token
Headers: Authorization: Bearer <token>
Body: {
  "pushToken": "ExponentPushToken[xxxxx]",
  "platform": "ios" | "android",
  "deviceId": "iPhone 13"
}
```

### Remove Push Token
```
DELETE /user/push-token
Headers: Authorization: Bearer <token>
```

---

**Setup Complete!** 🎉 Your app is now ready to send and receive push notifications.

