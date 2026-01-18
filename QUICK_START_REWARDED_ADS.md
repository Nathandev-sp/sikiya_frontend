# 🚀 Quick Start: Testing Rewarded Ads

## ⚡ Fast Setup (2 minutes)

### Step 1: Create .env File

Run this command in your terminal:

```bash
cd /Users/nathancibonga/Desktop/sikiya_frontend
cat > .env << 'EOF'
# iOS Rewarded Ad Unit ID (Test ID for development)
EXPO_PUBLIC_ADMOB_REWARDED_AD_UNIT_ID=ca-app-pub-3940256099942544/1712485313
EOF
```

**Or manually create the file:**

1. Create a file named `.env` in `/Users/nathancibonga/Desktop/sikiya_frontend/`
2. Add this line:
   ```
   EXPO_PUBLIC_ADMOB_REWARDED_AD_UNIT_ID=ca-app-pub-3940256099942544/1712485313
   ```

### Step 2: Restart Expo Server

```bash
# Stop current server (Ctrl+C)
# Then restart with clear cache:
npx expo start --dev-client --clear
```

### Step 3: Test on Device

**🎯 Test Video Ads:**
1. Open LiveNews screen
2. Scroll through 10 videos
3. "Watch an ad" prompt appears
4. Click button → Test ad plays
5. Complete ad → 10 more videos unlocked ✅

**🎯 Test Comment Ads:**
1. Go to any article/video
2. Add 2 main comments (daily limit)
3. Try to add a 3rd comment
4. "Watch an ad" button appears
5. Click → Ad plays
6. Complete ad → 1 more comment unlocked ✅

## ✅ What Was Changed

1. **App.js** - Added AdMob initialization
2. **LiveNews.js** - Fixed handleWatchAd function ordering
3. **ADMOB_SETUP.md** - Full documentation created
4. **.env** - You need to create this (see Step 1 above)

## 🔧 Troubleshooting

**Nothing happens when clicking "Watch an ad":**
- Check console for errors
- Make sure .env file exists
- Restart Expo server
- Wait 30 seconds for ad to load

**"Ad not loaded yet" message:**
- Wait a moment and try again
- Ads take 5-30 seconds to load initially

**More help:** See `ADMOB_SETUP.md` for detailed troubleshooting

## 📱 Important Notes

- ✅ Test ads show "Test Ad" label
- ✅ Can skip test ads quickly
- ✅ Only works on **physical device** (not simulator)
- ✅ Only shows for **general users** (not journalist/admin)
- ⚠️ Replace test ID with real ID for production

## 🎉 You're Ready!

Just create the `.env` file and restart the server. Your rewarded ads are fully implemented and ready to test!

