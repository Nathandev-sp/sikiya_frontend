# AdMob Error Explained - Missing iOS App ID

## 🎯 What This Error Means

**"No 'iosAppId' was provided. The native Google Mobile Ads SDK will crash on iOS without it."**

This warning means:
- You have `react-native-google-mobile-ads` installed
- But you haven't configured the iOS App ID in `app.json`
- **If you try to show ads on iOS, the app will crash**

---

## ⚠️ Is This Critical?

**It depends:**

### If You're NOT Using Ads Yet:
- ✅ **Not critical** - Just a warning
- ✅ **App will work fine** - As long as you don't try to show ads
- ✅ **Can ignore for now** - Fix it when you're ready to add ads

### If You're Using Ads:
- ❌ **Critical** - App will crash when trying to show ads on iOS
- ❌ **Must fix** - Before building for iOS
- ❌ **Will break production** - If you submit to App Store with ads

---

## 🔧 How to Fix It

### Step 1: Get Your AdMob App IDs

1. Go to [Google AdMob Console](https://apps.admob.com/)
2. Sign in with your Google account
3. Click **"Apps"** in the sidebar
4. Click **"Add app"** (if you haven't created apps yet)
5. Select **Platform: iOS**
6. Fill in app details
7. **Copy the App ID** - It looks like: `ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX`

**Repeat for Android:**
- Create another app for Android
- Copy the Android App ID

---

### Step 2: Add to app.json

Update your `app.json` to include the App IDs:

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
      ],
      [
        "expo-notifications",
        {
          "icon": "./assets/icon.png",
          "color": "#04698F",
          "sounds": []
        }
      ]
    ]
  }
}
```

**Replace the `ca-app-pub-...` with your actual App IDs from AdMob.**

---

### Step 3: Rebuild Your App

After adding the App IDs, you need to rebuild:

```bash
npx eas-cli build --profile development --platform ios
```

**Why rebuild?** The AdMob plugin needs to be configured during the build process.

---

## 🔄 Alternative: Use Environment Variables

If you want to keep App IDs secret, use environment variables:

### In your `.env` file:
```
EXPO_PUBLIC_ADMOB_IOS_APP_ID=ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX
EXPO_PUBLIC_ADMOB_ANDROID_APP_ID=ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX
```

### In your `app.json`:
```json
{
  "expo": {
    "plugins": [
      [
        "react-native-google-mobile-ads",
        {
          "androidAppId": "${EXPO_PUBLIC_ADMOB_ANDROID_APP_ID}",
          "iosAppId": "${EXPO_PUBLIC_ADMOB_IOS_APP_ID}"
        }
      ]
    ]
  }
}
```

---

## 🚫 If You're NOT Using Ads

If you don't plan to use ads right now, you have two options:

### Option 1: Remove AdMob Package (Recommended)

```bash
npm uninstall react-native-google-mobile-ads
```

Then remove it from `app.json` plugins:
```json
{
  "expo": {
    "plugins": [
      "expo-font",
      "expo-video",
      // Remove react-native-google-mobile-ads from here
      [
        "expo-notifications",
        ...
      ]
    ]
  }
}
```

### Option 2: Keep It But Don't Use It

- ✅ **Keep the package** - Install it later when needed
- ✅ **Add placeholder App IDs** - Use test IDs for now
- ✅ **Fix later** - When you're ready to add ads

**Test App IDs (for development only):**
```json
{
  "androidAppId": "ca-app-pub-3940256099942544~3347511713",
  "iosAppId": "ca-app-pub-3940256099942544~1458002511"
}
```

⚠️ **Note:** These are Google's test IDs. Use them only for development, not production!

---

## 📝 Quick Checklist

- [ ] Decide: Are you using ads now?
  - **Yes** → Get real App IDs from AdMob and add to `app.json`
  - **No** → Remove package or add test IDs temporarily

- [ ] If using ads:
  - [ ] Create apps in AdMob Console
  - [ ] Get iOS App ID
  - [ ] Get Android App ID
  - [ ] Add to `app.json` plugins
  - [ ] Rebuild app

- [ ] If not using ads:
  - [ ] Remove `react-native-google-mobile-ads` package, OR
  - [ ] Add test App IDs temporarily

---

## 🎯 Summary

**What the error means:**
- AdMob package is installed but iOS App ID is missing
- App will crash if you try to show ads on iOS

**How to fix:**
1. Get App IDs from AdMob Console
2. Add to `app.json` plugins
3. Rebuild app

**If not using ads:**
- Remove the package, or
- Add test App IDs for now

**Bottom line:** This is only critical if you're using ads. If you're not using ads yet, you can ignore it or remove the package. 🚀

