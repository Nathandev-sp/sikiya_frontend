# Developer Mode FAQ - Common Questions

## 🔄 Do I Need to Restart Every Time?

### Short Answer: **NO!**

**Developer Mode is a one-time setup:**
- ✅ Enable it once
- ✅ Restart once (after first enabling)
- ✅ It stays enabled forever
- ✅ No need to restart or re-enable for each app launch

### What Happens:

**First Time (One-Time Setup):**
1. Enable Developer Mode
2. Restart iPhone (required once)
3. Confirm when prompted
4. **Done!** Developer Mode stays enabled

**Every Time After:**
- ✅ Just open your app normally
- ✅ No restart needed
- ✅ No re-enabling needed
- ✅ Developer Mode stays ON

**Think of it like:** Enabling Wi-Fi - you turn it on once, and it stays on. You don't need to turn it on every time you use the internet.

---

## 📱 Updating Your App in Development Build

### How Updates Work:

**JavaScript/React Code Changes:**
- ⚡ **Instant updates** - Hot reload (no rebuild needed!)
- ✅ **Just save your code** - Changes appear immediately
- ✅ **No restart needed** - App updates while running

**Native Features (Packages/Config):**
- ⏳ **Need to rebuild** - Takes 15-20 minutes
- ✅ **Then continue with hot reload** - Code changes are instant again

---

## 🚀 How to Update Your App

### Method 1: Hot Reload (For Code Changes) - INSTANT ⚡

**This is the magic of development builds!**

1. **Make changes to your code** (JavaScript/React)
2. **Save the file**
3. **See changes instantly** on your device!

**No rebuild needed!** The app updates automatically while running.

**Example:**
```
1. Change button color in code
2. Save file
3. App updates instantly on device (hot reload)
4. Total time: 2 seconds ⚡
```

### Method 2: Rebuild (For Native Features) - 15-20 minutes ⏳

**Only needed when:**
- Installing new packages (like `expo-notifications`)
- Changing `app.json` native configuration
- Updating Expo SDK

**Process:**
1. **Make native changes** (install package, etc.)
2. **Rebuild:**
   ```bash
   npx eas-cli build --profile development --platform ios
   ```
3. **Wait 15-20 minutes** for build
4. **Install new build** on iPhone (replaces old one)
5. **Continue with hot reload** for code changes

---

## 📊 Update Comparison

| Change Type | Update Method | Time | Restart Needed? |
|-------------|--------------|------|-----------------|
| **Button color** | Hot reload | 2 seconds | ❌ No |
| **New screen** | Hot reload | 30 seconds | ❌ No |
| **Bug fix** | Hot reload | 1 minute | ❌ No |
| **Add feature** | Hot reload | Instant | ❌ No |
| **Install package** | Rebuild | 15-20 min | ✅ Yes (install new build) |
| **Change app.json** | Rebuild | 15-20 min | ✅ Yes (install new build) |

---

## 🔄 Daily Workflow

### Typical Day of Development:

**Morning:**
1. Open your development build app on iPhone
2. Run: `npx expo start --dev-client`
3. App connects and loads

**Throughout the Day:**
1. Make code changes
2. Save files
3. See changes instantly (hot reload)
4. Test immediately
5. Make more changes
6. Repeat!

**No restarts needed!** Just keep coding and see changes instantly.

**Example Day:**
```
9:00 AM - Start dev server, app loads
9:05 AM - Change button color → See it instantly
9:10 AM - Add new screen → See it instantly
9:15 AM - Fix bug → See fix instantly
9:20 AM - Update styling → See it instantly
... (make 50+ changes throughout the day)
5:00 PM - Done! No rebuilds needed
```

---

## ⚡ Hot Reload - How It Works

### What is Hot Reload?

**Hot reload** automatically updates your app when you save code changes. It's like live preview for mobile apps!

**How to use it:**
1. **Start dev server:**
   ```bash
   npx expo start --dev-client
   ```

2. **Open your app** on iPhone (the development build you installed)

3. **Make code changes** in your editor

4. **Save the file**

5. **App updates instantly** on your device!

**No need to:**
- ❌ Rebuild the app
- ❌ Restart the app
- ❌ Reinstall anything
- ❌ Wait for builds

**Just save and see changes!**

---

## 🔄 When Do You Need to Rebuild?

### You DON'T Need to Rebuild For:
- ✅ JavaScript/React code changes
- ✅ UI changes
- ✅ Styling changes
- ✅ Adding screens
- ✅ Fixing bugs
- ✅ Changing app logic
- ✅ Most day-to-day development

**All of these update instantly with hot reload!**

### You DO Need to Rebuild For:
- ⚠️ Installing new packages (like `expo-notifications`)
- ⚠️ Changing `app.json` native configuration
- ⚠️ Updating Expo SDK version
- ⚠️ Adding native features

**These require rebuilding (15-20 minutes), then you can continue with hot reload.**

---

## 📱 Installing Updated Build

### When You Rebuild:

1. **Build completes** - EAS gives you new download link
2. **Open link on iPhone** - Download new `.ipa` file
3. **Install** - It replaces the old build
4. **Open app** - Your app is updated
5. **Continue development** - Hot reload works again

**The new build replaces the old one** - you don't have multiple versions.

---

## 🎯 Real-World Example

### Week 1: Initial Setup

**Day 1:**
- Enable Developer Mode (one-time, restart once)
- Build development build (15 min)
- Install on iPhone
- Start developing

**Day 2-7:**
- Make hundreds of code changes
- All update instantly (hot reload)
- No rebuilds needed
- No restarts needed

### Week 2: Adding Push Notifications

**Day 8:**
- Install `expo-notifications` package
- Rebuild development build (15 min)
- Install new build on iPhone
- Continue with hot reload for code changes

**Day 9-14:**
- Make more code changes
- All update instantly (hot reload)
- No more rebuilds needed

---

## ✅ Summary

### Developer Mode:
- ✅ **Enable once** - Stays enabled forever
- ✅ **Restart once** - After first enabling
- ✅ **No restart needed** - For each app launch
- ✅ **No re-enabling needed** - It stays ON

### Updating Your App:

**Code Changes (99% of the time):**
- ⚡ **Hot reload** - Instant updates
- ✅ **Just save** - Changes appear immediately
- ✅ **No rebuild** - No restart needed

**Native Features (1% of the time):**
- ⏳ **Rebuild** - 15-20 minutes
- ✅ **Install new build** - Replaces old one
- ✅ **Continue with hot reload** - Code changes are instant again

---

## 🎓 Key Takeaways

1. **Developer Mode:** One-time setup, stays enabled
2. **Code updates:** Instant with hot reload (no rebuild)
3. **Native updates:** Rebuild needed (15-20 min), then hot reload again
4. **No restarts:** After initial setup, just code and see changes!

**Bottom line:** Enable Developer Mode once, restart once. After that, just code and see changes instantly with hot reload. Only rebuild when adding native features! 🚀

