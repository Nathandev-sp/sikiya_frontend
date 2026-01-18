# AdMob Rewarded Ads Setup Guide

This guide will help you set up and test rewarded ads in the Sikiya app.

## Prerequisites

- ✅ `react-native-google-mobile-ads` is already installed
- ✅ AdMob plugin is configured in `app.json`
- ✅ AdMob initialization added to `App.js`
- ✅ Rewarded ad components already implemented

## Quick Setup for Testing

### 1. Create `.env` file

Create a `.env` file in the root of `sikiya_frontend` directory:

```bash
# In terminal at /Users/nathancibonga/Desktop/sikiya_frontend
touch .env
```

### 2. Add Environment Variables

Add the following to your `.env` file:

```env
# For TESTING - Use Google's test ad unit ID
EXPO_PUBLIC_ADMOB_REWARDED_AD_UNIT_ID=ca-app-pub-3940256099942544/1712485313

# For PRODUCTION - Replace with your actual iOS ad unit ID from AdMob
# EXPO_PUBLIC_ADMOB_REWARDED_AD_UNIT_ID=ca-app-pub-4209533645500238/YOUR_AD_UNIT_ID
```

**Important Notes:**
- ✅ Use the test ID `ca-app-pub-3940256099942544/1712485313` for iOS testing
- ✅ For Android testing, use: `ca-app-pub-3940256099942544/5224354917`
- ⚠️ Test ads will show "Test Ad" label
- ⚠️ You can complete test ads instantly without watching the full duration
- ⚠️ Don't use test IDs in production - you won't earn revenue and might violate AdMob policies

### 3. Restart Expo Dev Server

After creating/updating `.env`, restart your development server:

```bash
# Stop the current server (Ctrl+C in terminal)
# Then restart:
npx expo start --dev-client
```

## How Rewarded Ads Work in Your App

### In LiveNews Screen (Video Feed)

1. **User watches 10 videos** → Ad modal appears
2. **User clicks "Watch an ad"** → Rewarded ad plays
3. **User completes ad** → Unlocks 10 more videos
4. Backend endpoint called: `POST /user/videos/unlock`

### In Comment Section

1. **User reaches daily comment limit** → "Watch an ad" button appears in CommentInputModal
2. **User clicks "Watch an ad"** → RewardedAdModal appears
3. **User clicks "Watch Ad" in modal** → Rewarded ad plays
4. **User completes ad** → Unlocks 1 more main comment
5. Backend endpoint called: `POST /user/comments/unlock`

## Code Flow

```
User Action
    ↓
handleUnlockComment() or handleUnlockVideos()
    ↓
setShowAdModal(true) → Shows RewardedAdModal
    ↓
User clicks "Watch Ad" → handleWatchAd()
    ↓
showRewardedAd() from useRewardedAd hook
    ↓
Google AdMob shows ad
    ↓
User completes ad → EARNED_REWARD event
    ↓
API call to unlock (videos or comments)
    ↓
Quota updated, user can continue
```

## Testing Checklist

- [ ] `.env` file created with test ad unit ID
- [ ] Expo dev server restarted after creating `.env`
- [ ] App running on physical device (ads don't work in simulator)
- [ ] Logged in as a **general user** (ads only show for general users)
- [ ] Internet connection active

## Testing Scenarios

### Test 1: Video Unlock
1. Open LiveNews screen
2. Scroll through 10 videos
3. Ad modal should appear
4. Click "Watch an ad"
5. Ad should load and play
6. Complete the ad (or skip test ad)
7. Verify 10 more videos are unlocked

### Test 2: Comment Unlock
1. Go to any article or video
2. Try to add a main comment (should work)
3. Keep adding comments until you reach the daily limit (2 by default)
4. Try to add another comment
5. CommentInputModal should show "Watch an ad" button
6. Click "Watch an ad"
7. RewardedAdModal appears
8. Click "Watch Ad"
9. Ad should load and play
10. Complete the ad
11. Verify you can now add another main comment

## Troubleshooting

### Ad Not Showing

**Symptom**: Button pressed but nothing happens

**Solutions**:
1. Check console logs for errors
2. Verify `.env` file exists and has correct format
3. Restart Expo dev server: `npx expo start --dev-client --clear`
4. Make sure you're on a physical device (not simulator)
5. Check internet connection
6. Wait 30 seconds - first ad load can be slow

### "Ad not loaded yet" Alert

**Symptom**: Alert shows "Ad is still loading"

**Solution**: 
- Ads take 5-30 seconds to load initially
- Wait and try again
- Check console for "Rewarded ad not available or not loaded yet"

### Environment Variable Not Found

**Symptom**: Console shows "Rewarded ad unit ID not configured"

**Solutions**:
1. Verify `.env` file is in the root of `sikiya_frontend`
2. Check variable name: `EXPO_PUBLIC_ADMOB_REWARDED_AD_UNIT_ID`
3. Restart Expo dev server completely
4. Clear cache: `npx expo start --dev-client --clear`

### AdMob Package Not Available

**Symptom**: Console shows "react-native-google-mobile-ads not available"

**Solution**:
```bash
# Reinstall the package
npm install react-native-google-mobile-ads

# Rebuild the development client
npx expo prebuild --clean
eas build --profile development --platform ios
```

## Development vs Production

### Development Mode (`__DEV__ === true`)
- Automatically uses test ad unit IDs from `TestIds.REWARDED`
- Shows test ads with "Test Ad" label
- Can skip ads instantly
- Perfect for testing without affecting AdMob account

### Production Mode (Release Build)
- Uses ad unit ID from `.env` file
- Shows real ads from advertisers
- Users must watch full duration
- You earn revenue from completed ads

## Getting Real AdMob Ad Unit IDs

When you're ready for production:

1. Go to [AdMob Console](https://apps.admob.com)
2. Select your app or create a new app
3. Go to "Ad units"
4. Create a new "Rewarded" ad unit
5. Copy the ad unit ID (format: `ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX`)
6. Replace in `.env`:
   ```env
   EXPO_PUBLIC_ADMOB_REWARDED_AD_UNIT_ID=ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX
   ```
7. Build a production release

## Current Implementation Status

✅ **Completed:**
- AdMob package installed (`react-native-google-mobile-ads@16.0.1`)
- App.json configured with AdMob app IDs
- AdMob initialized in App.js
- RewardedAd hook (`useRewardedAd`) implemented
- RewardedAdModal component created
- LiveNews screen fully integrated
- CommentInputModal integrated
- Backend unlock routes working

🎯 **Ready to Test:**
- Just need to create `.env` file and restart server
- Everything else is already set up!

## Support

If you encounter issues:
1. Check console logs for detailed error messages
2. Verify all steps in Testing Checklist
3. Make sure you're testing on a physical device
4. Ensure you're logged in as a general user (not journalist/admin)
5. Wait 30 seconds for initial ad load

## Files Modified

- ✅ `App.js` - Added AdMob initialization
- ✅ `src/Components/Ads/RewardedAd.js` - Hook implementation (already existed)
- ✅ `src/Components/Ads/RewardedAdModal.js` - Modal UI (already existed)
- ✅ `src/Screens/LiveNews.js` - Video unlock integration (already existed)
- ✅ `FeedbackComponent/CommentInputModal.js` - Comment unlock integration (already existed)

---

**You're all set!** Just create the `.env` file and you can start testing rewarded ads. 🎉

