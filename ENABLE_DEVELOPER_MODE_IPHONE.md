# How to Enable Developer Mode on iPhone

Developer Mode is required to install development builds on your iPhone. Here's how to enable it.

---

## 🎯 Quick Answer

**iOS 16 and later:**
1. Go to **Settings** → **Privacy & Security**
2. Scroll down to **Developer Mode**
3. Toggle it **ON**
4. Restart your iPhone
5. Confirm when prompted

**iOS 15 and earlier:**
- Developer Mode doesn't exist
- Just trust the developer certificate (see below)

---

## 📱 Step-by-Step Instructions

### For iOS 16+ (Most iPhones Now):

#### Step 1: Open Settings
- Tap the **Settings** app on your iPhone

#### Step 2: Go to Privacy & Security
- Scroll down and tap **Privacy & Security**

#### Step 3: Find Developer Mode
- Scroll down to the bottom
- Look for **Developer Mode**
- If you don't see it, you may need to connect to Xcode first (see below)

#### Step 4: Enable Developer Mode
- Toggle **Developer Mode** to **ON** (green)
- You'll see a warning popup

#### Step 5: Restart iPhone
- Tap **Restart** in the popup
- OR manually restart: Hold power button → Slide to power off → Turn back on

#### Step 6: Confirm After Restart
- After restart, you'll see a popup asking to confirm
- Tap **Turn On**
- Enter your passcode if prompted

#### Step 7: Done!
- Developer Mode is now enabled
- You can now install development builds

---

## 🔍 If You Don't See Developer Mode

### Option 1: Connect to Xcode (Easiest)

If Developer Mode doesn't appear, you need to trigger it first:

1. **Install Xcode** on your Mac (if you have one)
   - Download from Mac App Store (free, but large ~15GB)
   - OR use a friend's Mac

2. **Connect iPhone to Mac** with USB cable

3. **Open Xcode** on Mac

4. **Trust the device:**
   - Xcode will ask to trust your iPhone
   - Tap "Trust" on iPhone
   - Enter passcode

5. **Developer Mode appears:**
   - Now go to Settings → Privacy & Security
   - Developer Mode should appear!

### Option 2: Install Development Build First

Sometimes Developer Mode appears after you try to install a development build:

1. **Try to install development build** (from EAS link)
2. **iPhone may prompt** you to enable Developer Mode
3. **Follow the prompts** to enable it

---

## 🔐 Trust Developer Certificate (Also Needed)

Even with Developer Mode enabled, you also need to trust the developer certificate:

### After Installing Development Build:

1. **Go to Settings** → **General** → **VPN & Device Management**
   - (On older iOS: Settings → General → Device Management)

2. **Find your developer name** in the list
   - Look for something like "Apple Development: Your Name" or "Expo"

3. **Tap on it**

4. **Tap "Trust [Developer Name]"**

5. **Tap "Trust" again** in the confirmation popup

6. **Done!** Your app should now work

---

## 📊 iOS Version Check

### Check Your iOS Version:

1. Go to **Settings** → **General** → **About**
2. Look at **Software Version**
3. See which instructions apply:

**iOS 16+:** Need Developer Mode
**iOS 15 and earlier:** No Developer Mode needed, just trust certificate

---

## ⚠️ Important Notes

### Developer Mode Requirements:

- ✅ **iOS 16 or later** - Developer Mode exists
- ✅ **iOS 15 and earlier** - No Developer Mode, just trust certificate
- ✅ **Physical device** - Developer Mode only works on real devices (not simulator)

### Security Warning:

- You'll see warnings about Developer Mode
- This is normal and safe
- It's required for installing development builds
- You can disable it later if needed

### What Developer Mode Does:

- Allows installing apps from developers (not just App Store)
- Required for development builds
- Required for TestFlight (sometimes)
- Safe to enable - you control what gets installed

---

## 🐛 Troubleshooting

### "Developer Mode not showing"

**Solutions:**
1. Make sure you're on iOS 16+
2. Connect to Xcode first (triggers Developer Mode)
3. Try installing a development build (may prompt you)
4. Restart your iPhone

### "Can't find VPN & Device Management"

**On iOS 15 and earlier:**
- Look for **Device Management** (without VPN)
- Settings → General → Device Management

**On iOS 16+:**
- Settings → General → VPN & Device Management

### "App still won't open after enabling"

**Check:**
1. Developer Mode is ON (green toggle)
2. You've trusted the developer certificate
3. You've restarted iPhone after enabling Developer Mode
4. The build hasn't expired (iOS development builds expire after 7 days)

### "Don't have a Mac for Xcode"

**Alternatives:**
1. **Use a friend's Mac** - Just connect once to trigger Developer Mode
2. **Try installing build first** - May prompt you to enable Developer Mode
3. **Use TestFlight** - Doesn't require Developer Mode (but requires production build)

---

## ✅ Quick Checklist

Before installing development build:

- [ ] iPhone is iOS 16+ (check in Settings → General → About)
- [ ] Developer Mode is enabled (Settings → Privacy & Security → Developer Mode)
- [ ] iPhone has been restarted after enabling Developer Mode
- [ ] Developer certificate is trusted (Settings → General → VPN & Device Management)
- [ ] Development build is downloaded and ready to install

---

## 🎯 Summary

### iOS 16+:
1. Settings → Privacy & Security → Developer Mode → ON
2. Restart iPhone
3. Confirm when prompted
4. Trust developer certificate after installing build

### iOS 15 and earlier:
1. No Developer Mode needed
2. Just trust developer certificate after installing build

### If Developer Mode doesn't appear:
1. Connect to Xcode (triggers it)
2. OR try installing build first (may prompt you)

---

**That's it!** Once Developer Mode is enabled and you've trusted the certificate, you can install and run development builds on your iPhone! 🚀

