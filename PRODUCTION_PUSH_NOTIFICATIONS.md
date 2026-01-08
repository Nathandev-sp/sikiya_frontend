# Push Notifications in Production Builds

This guide explains how push notifications work when your app is built as a standalone app (production build) vs development builds and Expo Go.

## 🔄 How It Works in Different Build Types

### 1. Expo Go (Development)
- ✅ **Works automatically** - No additional setup needed
- ✅ Uses Expo's managed push notification service
- ✅ Perfect for development and testing
- ⚠️ **Limitation**: Only works while using Expo Go app

### 2. Development Builds (EAS Build --profile development)
- ✅ **Works with minimal setup** - Just need Expo Project ID
- ✅ Uses Expo's managed push notification service
- ✅ Perfect for testing native features
- ✅ Can test on physical devices
- 📝 **Requires**: `EXPO_PUBLIC_PROJECT_ID` in `.env` file

### 3. Production Builds (Standalone Apps / App Store / Play Store)
- ⚠️ **Requires additional setup** for iOS and Android
- ✅ **iOS**: Needs APNs (Apple Push Notification service) certificates
- ✅ **Android**: Needs FCM (Firebase Cloud Messaging) configuration
- ✅ Uses Expo's managed service, but requires platform-specific credentials
- 📝 **This is what you need for App Store/Play Store releases**

## 🚀 Setting Up for Production Builds

### For iOS (APNs Setup)

#### Step 1: Create APNs Key in Apple Developer Portal

1. Go to [Apple Developer Portal](https://developer.apple.com/account/)
2. Navigate to **Certificates, Identifiers & Profiles**
3. Go to **Keys** → Click **+** to create a new key
4. Name it (e.g., "Sikiya Push Notifications")
5. Enable **Apple Push Notifications service (APNs)**
6. Click **Continue** → **Register**
7. **Download the `.p8` key file** (you can only download it once!)
8. Note the **Key ID** (shown on the key details page)

#### Step 2: Configure in EAS Build

**Option A: Using EAS Build (Recommended)**

When you run `eas build --profile production --platform ios`, EAS will prompt you to:
1. Upload your APNs key (`.p8` file)
2. Enter your Key ID
3. Enter your Team ID (found in Apple Developer Portal)

EAS will automatically configure everything for you.

**Option B: Manual Configuration**

Add to your `app.json`:

```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.sikiya.app",
      "infoPlist": {
        "UIBackgroundModes": ["remote-notification"]
      }
    }
  }
}
```

Then configure APNs in your Apple Developer account and link it through EAS.

#### Step 3: Build Production App

```bash
eas build --profile production --platform ios
```

EAS will handle the APNs configuration automatically.

---

### For Android (FCM Setup)

#### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **Add Project** or select existing project
3. Follow the setup wizard
4. Add an Android app to your project:
   - Package name: `com.sikiya.app` (must match your `app.json`)
   - App nickname: "Sikiya Android"
   - Download `google-services.json`

#### Step 2: Get FCM Server Key

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Go to **Cloud Messaging** tab
3. Copy the **Server key** (you'll need this for your backend)
4. Note the **Sender ID** (Project number)

#### Step 3: Add google-services.json to Your Project

1. Download `google-services.json` from Firebase Console
2. Place it in your project root: `/Users/nathancibonga/Desktop/sikiya_frontend/google-services.json`
3. The `app.json` is already configured to use it:
   ```json
   "android": {
     "googleServicesFile": "./google-services.json"
   }
   ```

#### Step 4: Build Production App

```bash
eas build --profile production --platform android
```

EAS will automatically include the `google-services.json` file in your build.

---

## 📋 Complete Production Setup Checklist

### Before Building for Production:

- [ ] **iOS**:
  - [ ] Created APNs key in Apple Developer Portal
  - [ ] Downloaded `.p8` key file (saved securely)
  - [ ] Noted Key ID and Team ID
  - [ ] Updated `app.json` with bundle identifier
  - [ ] Configured `infoPlist` with `UIBackgroundModes`

- [ ] **Android**:
  - [ ] Created Firebase project
  - [ ] Added Android app to Firebase
  - [ ] Downloaded `google-services.json`
  - [ ] Placed `google-services.json` in project root
  - [ ] Updated `app.json` with package name
  - [ ] Got FCM Server Key for backend

- [ ] **Both**:
  - [ ] Set `EXPO_PUBLIC_PROJECT_ID` in `.env` file
  - [ ] Tested notifications in development build first
  - [ ] Backend is ready to send notifications

---

## 🔧 EAS Build Configuration

Create or update `eas.json` in your project root:

```json
{
  "build": {
    "production": {
      "distribution": "store",
      "ios": {
        "bundleIdentifier": "com.sikiya.app"
      },
      "android": {
        "package": "com.sikiya.app"
      }
    },
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "your-app-store-connect-app-id",
        "appleTeamId": "YOUR_TEAM_ID"
      },
      "android": {
        "serviceAccountKeyPath": "./path-to-service-account.json",
        "track": "internal"
      }
    }
  }
}
```

---

## 🧪 Testing Production Builds

### Testing iOS Production Build:

1. **Build for TestFlight**:
   ```bash
   eas build --profile production --platform ios
   ```

2. **Submit to TestFlight**:
   ```bash
   eas submit --platform ios
   ```

3. **Test on Device**:
   - Install TestFlight app
   - Install your app from TestFlight
   - Test push notifications

### Testing Android Production Build:

1. **Build APK/AAB**:
   ```bash
   eas build --profile production --platform android
   ```

2. **Install on Device**:
   - Download the APK from EAS dashboard
   - Install on Android device
   - Test push notifications

---

## 🔐 Important Security Notes

### For Your Backend:

When sending notifications in production, you'll need:

**iOS**: 
- APNs key (`.p8` file) or certificate
- Key ID
- Team ID
- Bundle ID

**Android**:
- FCM Server Key (from Firebase Console)
- Sender ID

**Never commit these to your repository!** Store them securely:
- Use environment variables
- Use a secrets management service
- Store in your backend's secure configuration

---

## 📱 How Notifications Work in Production

The flow is the same as development, but with platform-specific credentials:

1. **App requests permission** → User grants
2. **App gets push token** → Expo generates token (same as dev)
3. **App sends token to backend** → Backend stores it
4. **Backend sends notification** → Uses Expo API with platform credentials
5. **Expo routes to platform** → Expo uses APNs (iOS) or FCM (Android)
6. **Platform delivers** → iOS/Android delivers to device
7. **Device shows notification** → User sees notification

The key difference: In production, Expo uses your APNs/FCM credentials to route notifications through Apple/Google's services.

---

## 🐛 Troubleshooting Production Builds

### iOS Notifications Not Working?

1. **Check APNs Configuration**:
   - Verify APNs key is uploaded to EAS
   - Check Key ID and Team ID are correct
   - Ensure bundle identifier matches

2. **Check App Capabilities**:
   - In Xcode, verify "Push Notifications" capability is enabled
   - Check "Background Modes" → "Remote notifications" is enabled

3. **Check Certificates**:
   - Verify your provisioning profile includes push notifications
   - Check certificate hasn't expired

### Android Notifications Not Working?

1. **Check Firebase Setup**:
   - Verify `google-services.json` is in project root
   - Check package name matches Firebase project
   - Ensure FCM is enabled in Firebase Console

2. **Check Build Configuration**:
   - Verify `google-services.json` is included in build
   - Check package name in `app.json` matches Firebase

3. **Check Permissions**:
   - Verify notification permissions are granted
   - Check device notification settings

---

## 💡 Quick Reference

### Development (Expo Go):
```bash
# Just works! No setup needed
npx expo start
```

### Development Build:
```bash
# Need: EXPO_PUBLIC_PROJECT_ID in .env
eas build --profile development --platform ios
npx expo start --dev-client
```

### Production Build:
```bash
# Need: APNs (iOS) + FCM (Android) setup
eas build --profile production --platform all
```

---

## 📚 Additional Resources

- [Expo Push Notifications - Production Setup](https://docs.expo.dev/push-notifications/push-notifications-setup/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Apple Push Notification Service](https://developer.apple.com/documentation/usernotifications)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)

---

**Key Takeaway**: Push notifications work in all build types, but production builds require platform-specific credentials (APNs for iOS, FCM for Android) that EAS Build can help you configure automatically.

