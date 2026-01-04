# AdMob Setup Guide for Sikiya App

This guide explains how AdMob (Google AdMob) works in your Expo/React Native app and how to implement ad components.

---

## 📱 How AdMob Works in React Native/Expo

### Ad Types:

1. **Banner Ads** - Small rectangular ads that appear at the top or bottom of screens
2. **Interstitial Ads** - Full-screen ads shown between screens/content
3. **Rewarded Ads** - Full-screen ads that users watch to earn rewards (like unlocking more videos)

### User Role Logic:

- **General Users (`role: 'general'`)**: See ads
- **Contributor Users (`role: 'contributor'`)**: No ads (ad-free experience)

---

## 🚀 Setup Steps

### Step 1: Install the Package

For Expo SDK 54+, use `react-native-google-mobile-ads`:

```bash
cd "Sikiya Frontend"
npx expo install react-native-google-mobile-ads
```

### Step 2: Get AdMob App IDs

1. Go to [Google AdMob Console](https://apps.admob.com/)
2. Create an account or sign in
3. Add your app (iOS and/or Android)
4. Get your App IDs:
   - **Android App ID**: `ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX`
   - **iOS App ID**: `ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX`

### Step 3: Configure app.json

Add AdMob configuration to `app.json`:

```json
{
  "expo": {
    "plugins": [
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

### Step 4: Get Ad Unit IDs

In AdMob Console:
1. Go to **Ad units** → **Create ad unit**
2. Select your Android app (or iOS app - it doesn't matter which one you use)
3. Create ad units for:
   - **Banner Ad**: `ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX`
   - **Interstitial Ad**: `ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX`
   - **Rewarded Ad**: `ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX`

**Important**: You can use the **same ad unit IDs for both Android and iOS!** 
- Ad unit IDs are platform-agnostic (work on both platforms)
- The platform is determined by your App ID, not the ad unit ID
- However, you CAN create separate ad units for better tracking/analytics if you want

### Step 5: Add Environment Variables

Create/update `.env` file:

```env
# AdMob Configuration
EXPO_PUBLIC_ADMOB_ANDROID_APP_ID=ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX
EXPO_PUBLIC_ADMOB_IOS_APP_ID=ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX
EXPO_PUBLIC_ADMOB_BANNER_AD_UNIT_ID=ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX
EXPO_PUBLIC_ADMOB_INTERSTITIAL_AD_UNIT_ID=ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX
EXPO_PUBLIC_ADMOB_REWARDED_AD_UNIT_ID=ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX
```

---

## 🎯 How It Works in Your App

### Architecture:

```
User opens app
  ↓
Check user role (from AuthContext)
  ↓
If role === 'general' → Show ads
If role === 'contributor' → Hide ads (ad-free)
```

### Ad Placement Strategy:

1. **Banner Ads**:
   - HomeScreen (bottom)
   - Article screens (bottom)
   - Profile screens (for general users)

2. **Interstitial Ads**:
   - Between article navigation
   - After watching videos (for general users)

3. **Rewarded Ads**:
   - "Watch 3 ads to unlock more videos" (for general users)
   - Track ad views in backend

---

## 📝 Code Structure

### Components Created:

1. **BannerAd.js** - Banner ad component (conditional on user role)
2. **InterstitialAd.js** - Interstitial ad helper/hook
3. **RewardedAd.js** - Rewarded ad component for unlocking videos
4. **AdWrapper.js** - Wrapper component that checks user role

### Usage Pattern:

```javascript
// In any screen
import BannerAd from '../Components/Ads/BannerAd';
import { useContext } from 'react';
import { Context as AuthContext } from '../Context/AuthContext';

const MyScreen = () => {
  const { state } = useContext(AuthContext);
  const userRole = state?.role;

  return (
    <View>
      {/* Your content */}
      
      {/* Banner ad - only shows for general users */}
      {userRole === 'general' && <BannerAd />}
    </View>
  );
};
```

---

## 🔐 Testing Ads

### Test Ad Unit IDs (Use during development):

- **Banner**: `ca-app-pub-3940256099942544/6300978111`
- **Interstitial**: `ca-app-pub-3940256099942544/1033173712`
- **Rewarded**: `ca-app-pub-3940256099942544/5224354917`

**Important**: Use test IDs during development, switch to real IDs in production!

---

## ⚠️ Important Notes

1. **User Role Check**: Always check `state.role` from `AuthContext` before showing ads
2. **Ad Blocking**: Contributors should never see ads
3. **Performance**: Ads can impact performance, so conditionally render
4. **Revenue**: Real ads only work in production builds, not Expo Go
5. **Testing**: Use test ad unit IDs during development

---

## 🎬 Next Steps

1. Install the package
2. Set up AdMob account
3. Add configuration to `app.json`
4. Create ad components (I'll create these for you)
5. Integrate ads into screens
6. Test with test ad unit IDs
7. Switch to real ad unit IDs for production

Let me know when you're ready, and I'll create the ad components for you!

