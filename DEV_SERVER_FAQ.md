# Development Server FAQ

## 🔄 Do I Always Need to Start the Dev Server?

### Short Answer: **Yes, for development builds**

**For Development Builds:**
- ✅ **Yes, you need to start the dev server** every time you want to use the app
- ✅ **The app needs the server** to load your JavaScript code
- ✅ **Without the server**, the app shows "No development servers found"

**For Production Builds:**
- ❌ **No dev server needed** - The code is bundled into the app
- ✅ **Works offline** - App runs independently
- ✅ **Like a real app** - Users don't need your computer

---

## 📱 Can I Use the App When Not Home?

### Short Answer: **Yes, but with limitations**

**Development Build (Current Setup):**
- ⚠️ **Usually requires same Wi-Fi** - Phone and computer must be on same network
- ✅ **Can use tunnel mode** - Works over internet (slower)
- ✅ **Can use USB connection** - Works anywhere (if computer is with you)

**Production Build:**
- ✅ **Works anywhere** - No connection needed
- ✅ **Like App Store app** - Fully independent

---

## 🎯 Two Types of Apps

### 1. Development Build (What You Have Now)

**How it works:**
- App shell is installed on your phone
- JavaScript code runs from your computer (via dev server)
- Need dev server running to use the app
- Hot reload works (instant updates)

**When you need dev server:**
- ✅ Every time you open the app
- ✅ To see your code changes
- ✅ To test new features

**Can use when not home?**
- ⚠️ Usually no (needs same Wi-Fi)
- ✅ Yes, with tunnel mode (slower)
- ✅ Yes, with USB (if computer is with you)

---

### 2. Production Build (Standalone App)

**How it works:**
- Everything is bundled into the app
- No dev server needed
- Works like a real App Store app
- No hot reload (need to rebuild for changes)

**When you need dev server:**
- ❌ Never! Works independently

**Can use when not home?**
- ✅ Yes! Works anywhere, anytime
- ✅ No connection needed
- ✅ Like any other app on your phone

---

## 🚀 Using App When Not Home

### Option 1: Tunnel Mode (Works Over Internet)

**Start server with tunnel:**
```bash
npx expo start --dev-client --tunnel
```

**How it works:**
- Creates a tunnel through Expo's servers
- Works over the internet (not just Wi-Fi)
- Slower than local network, but works anywhere

**Pros:**
- ✅ Works when not on same Wi-Fi
- ✅ Works from anywhere
- ✅ No USB needed

**Cons:**
- ⚠️ Slower than local network
- ⚠️ Requires internet connection

---

### Option 2: USB Connection

**Connect iPhone to Mac via USB:**
```bash
npx expo start --dev-client
```

Then in the app, manually enter:
```
exp://localhost:8081
```

**Pros:**
- ✅ Works anywhere (if you have your Mac)
- ✅ Fast connection
- ✅ No Wi-Fi needed

**Cons:**
- ⚠️ Need to carry your Mac
- ⚠️ Need USB cable

---

### Option 3: Build Standalone Version

**Build a production-like version:**
```bash
npx eas-cli build --profile production --platform ios
```

**Pros:**
- ✅ Works anywhere, anytime
- ✅ No dev server needed
- ✅ No connection needed
- ✅ Like a real app

**Cons:**
- ⚠️ Need to rebuild for changes (takes 20-30 minutes)
- ⚠️ No hot reload

---

## 📊 Comparison Table

| Feature | Development Build | Production Build |
|---------|------------------|------------------|
| **Need dev server?** | ✅ Yes, always | ❌ No |
| **Works offline?** | ❌ No | ✅ Yes |
| **Works when not home?** | ⚠️ With tunnel/USB | ✅ Yes |
| **Hot reload?** | ✅ Yes (instant) | ❌ No |
| **Rebuild for changes?** | ❌ No (for code) | ✅ Yes (20-30 min) |
| **Best for** | Development | Testing/Production |

---

## 💡 Recommended Workflow

### For Daily Development (At Home):
1. **Start dev server:** `npx expo start --dev-client`
2. **Open app** on iPhone
3. **Code and test** with hot reload
4. **Stop server** when done (Ctrl+C)

### For Testing Away from Home:

**Option A: Use Tunnel Mode**
```bash
npx expo start --dev-client --tunnel
```
- Works over internet
- Slower but functional

**Option B: Build Standalone Version**
```bash
npx eas-cli build --profile production --platform ios
```
- Works like real app
- No server needed
- Good for showing others

---

## 🎯 Real-World Scenarios

### Scenario 1: Developing at Home
- ✅ Use development build
- ✅ Start dev server
- ✅ Fast hot reload
- ✅ Perfect for coding

### Scenario 2: Showing App to Friend
- ✅ Build production version
- ✅ Install on their phone
- ✅ Works without your computer
- ✅ Professional experience

### Scenario 3: Testing on the Go
- ✅ Use tunnel mode: `--tunnel`
- ✅ Works over internet
- ✅ Can test anywhere

### Scenario 4: Final Testing
- ✅ Build production version
- ✅ Test like real users
- ✅ No dev server needed

---

## ✅ Summary

### Do you always need to start dev server?

**Development Build:**
- ✅ **Yes** - Every time you want to use the app
- ✅ **The app needs it** to load your code
- ✅ **Without it** - App shows "No development servers found"

**Production Build:**
- ❌ **No** - Works independently
- ✅ **Like App Store app** - No server needed

### Can you use app when not home?

**Development Build:**
- ⚠️ **Usually no** (needs same Wi-Fi)
- ✅ **Yes, with tunnel mode** (`--tunnel` flag)
- ✅ **Yes, with USB** (if you have your Mac)

**Production Build:**
- ✅ **Yes!** Works anywhere, anytime
- ✅ **No connection needed**
- ✅ **Like any other app**

---

## 🚀 Quick Answers

**Q: Do I always need to start dev server?**
- **A:** Yes, for development builds. No, for production builds.

**Q: Can I use app when not home?**
- **A:** Development build: Use `--tunnel` mode. Production build: Works anywhere!

**Q: What's the difference?**
- **A:** Development build = needs server, has hot reload. Production build = standalone, no server needed.

**Bottom line:** Development builds need the dev server running. Use tunnel mode to work remotely, or build a production version for standalone use! 🚀

