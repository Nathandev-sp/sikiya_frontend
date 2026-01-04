# Installing AdMob for Expo

## ⚠️ Important: Expo Limitations

**`react-native-google-mobile-ads` does NOT work with Expo Go!**

You need to:
1. Create a **development build** (EAS Build) - NOT Expo Go
2. Install the package
3. Rebuild your app

---

## 📦 Installation Steps

### Step 1: Install the Package

```bash
cd "Sikiya Frontend"
npx expo install react-native-google-mobile-ads
```

### Step 2: Configure app.json

Add the plugin to your `app.json`:

```json
{
  "expo": {
    "plugins": [
      "expo-font",
      "expo-video",
      [
        "react-native-google-mobile-ads",
        {
          "androidAppId": "ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX",
          "iosAppId": "ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX"
        }
      ]
    ]
  }
}
```

### Step 3: Create Development Build

Since this requires native code, you **cannot** use Expo Go. You need to create a development build:

#### Option A: Local Development Build (Recommended for Testing)

```bash
# For Android
npx expo run:android

# For iOS (Mac only)
npx expo run:ios
```

#### Option B: EAS Build (Cloud Build)

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS
eas build:configure

# Build development version
eas build --profile development --platform android
# or
eas build --profile development --platform ios
```

---

## 🔄 Current Status

I've updated the `BannerAd.js` component to handle the case where the package is not installed. It will:
- Show a warning in console if package is missing
- Return `null` (no ad shown) if package is not available
- Work normally once package is installed and app is rebuilt

This allows your app to continue working while you set up AdMob.

---

## ✅ After Installation

1. ✅ Package installed
2. ✅ app.json configured
3. ✅ Development build created
4. ✅ App rebuilt with native code
5. ✅ Ads will work!

---

## 📝 Quick Test

After installing and rebuilding, you can test by importing the component:

```javascript
import BannerAd from '../Components/Ads/BannerAd';

// In your component
<BannerAd position="bottom" />
```

If you see a test ad, it's working! 🎉


