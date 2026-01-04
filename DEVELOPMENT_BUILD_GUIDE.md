# Development Build Guide

This guide explains how to create development builds for your Sikiya app **without duplicating the project folder**.

---

## 🚫 Don't Duplicate the Folder!

**You do NOT need to duplicate your `Sikiya Frontend` folder.** You can create development builds directly from your existing project folder.

---

## 📋 Prerequisites

1. **EAS CLI installed globally:**
   ```bash
   npm install -g eas-cli
   ```

2. **Expo account:**
   - Sign up at [expo.dev](https://expo.dev) (free)
   - Login: `eas login`

3. **Project configured:**
   - Make sure you're in the `Sikiya Frontend` directory

---

## 🚀 Step-by-Step Setup

### Step 1: Configure EAS Build (One-time setup)

From your `Sikiya Frontend` directory:

```bash
cd "Sikiya Frontend"
eas build:configure
```

This creates `eas.json` in your project (if it doesn't exist).

---

### Step 2: Create Development Build

#### For iOS:
```bash
eas build --profile development --platform ios
```

#### For Android:
```bash
eas build --profile development --platform android
```

#### For Both:
```bash
eas build --profile development --platform all
```

---

### Step 3: Install on Device

1. **EAS provides a download link** in the terminal/build dashboard
2. Download the `.ipa` (iOS) or `.apk` (Android) file
3. Install on your device:
   - **iOS**: Use TestFlight or install via Xcode/Apple Configurator
   - **Android**: Enable "Install from unknown sources" and install the `.apk`

---

### Step 4: Run Development Server

```bash
npx expo start --dev-client
```

Your app will run in the custom development client (not Expo Go).

---

## 📁 Project Structure (What Happens)

**Your project structure stays the same:**
```
Sikiya_main/
├── Sikiya Frontend/          ← Work from here (no duplication needed!)
│   ├── src/
│   ├── package.json
│   ├── app.json
│   ├── eas.json              ← Created by eas build:configure
│   └── ...
├── Sikiya Backend/
└── Sikiya Home/
```

**The build happens in the cloud** (EAS Build servers), not in your local folder. Your local files remain unchanged.

---

## 🔄 Workflow

### Development Cycle:

1. **Make code changes** in `Sikiya Frontend/`
2. **Run dev server**: `npx expo start --dev-client`
3. **Test on device** with hot reload
4. **When you need native changes** (e.g., new packages), rebuild:
   ```bash
   eas build --profile development --platform ios
   ```

### When to Rebuild:

- ✅ When you install a new native package (like `expo-in-app-purchases`)
- ✅ When you change `app.json` native configuration
- ✅ When you update Expo SDK version
- ❌ **NOT needed** for regular JavaScript/React code changes (hot reload handles this)

---

## ⚙️ EAS Build Profiles

Your `eas.json` will have profiles like:

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true  // For iOS Simulator builds
      }
    },
    "production": {
      "distribution": "store"
    }
  }
}
```

---

## 💡 Benefits of This Approach

- ✅ **No folder duplication** - Keep everything in one place
- ✅ **Cloud builds** - Builds happen on EAS servers (faster)
- ✅ **Version control friendly** - All config in your repo
- ✅ **Easy to update** - Just rebuild when needed
- ✅ **Team collaboration** - Share builds via TestFlight/APK

---

## 🎯 Quick Reference

### First Time Setup:
```bash
cd "Sikiya Frontend"
npm install -g eas-cli
eas login
eas build:configure
eas build --profile development --platform ios
```

### Daily Development:
```bash
cd "Sikiya Frontend"
npx expo start --dev-client
```

### After Installing Native Package:
```bash
eas build --profile development --platform ios
```

---

## 📝 Notes

- **Free tier**: 30 builds/month (should be plenty for development)
- **Build time**: 10-20 minutes (first build, faster after)
- **Development builds**: Can test native features (IAP, AdMob, etc.)
- **Production builds**: Use `--profile production` when ready for App Store

---

## ❓ FAQ

**Q: Do I need to duplicate the folder?**  
A: No! Work directly from `Sikiya Frontend/`.

**Q: Where are builds stored?**  
A: On EAS servers. You download them when ready.

**Q: Will this affect my code?**  
A: No, builds happen in the cloud. Your local code stays the same.

**Q: Can I build for both iOS and Android from the same folder?**  
A: Yes! Use `--platform all` or build separately.

**Q: How often do I need to rebuild?**  
A: Only when you add native packages or change native config. Regular code changes work with hot reload.

---

**Just work from your existing `Sikiya Frontend` folder - no duplication needed!** 🎉


