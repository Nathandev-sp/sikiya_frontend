# Quick Start: Create Development Build (No Installation Needed!)

Having permission issues? **No problem!** You can use EAS CLI without installing it globally.

---

## 🚀 Quick Solution: Use npx

Instead of installing EAS CLI globally, just use `npx` - it works the same way!

---

## Step-by-Step (Using npx)

### Step 1: Login to Expo

```bash
npx eas-cli login
```

Enter your Expo username/email and password.

---

### Step 2: Configure EAS (One-Time Setup)

```bash
npx eas-cli build:configure
```

This creates `eas.json` in your project. Answer:
- "Set up EAS Build?" → **Yes**
- "Name your build profile?" → Press Enter (uses "development")
- "Configure credentials?" → **Yes**

---

### Step 3: Build for iOS

```bash
npx eas-cli build --profile development --platform ios
```

**What happens:**
- Uploads your project (takes a minute)
- Builds in the cloud (10-20 minutes)
- You'll see progress in terminal
- When done, you get a download link!

**EAS might ask:**
- "Use Expo's managed credentials?" → **Yes**
- "Generate new Apple certificate?" → **Yes** (if first time)

---

### Step 4: Build for Android (Same Folder!)

```bash
npx eas-cli build --profile development --platform android
```

Or build both at once:
```bash
npx eas-cli build --profile development --platform all
```

---

## 📱 After Build Completes

1. **Copy the download link** from the terminal
2. **For iOS:**
   - Open link on iPhone
   - Download the `.ipa` file
   - Go to Settings → General → VPN & Device Management
   - Trust the developer certificate
   - Open the app!

3. **For Android:**
   - Open link on Android phone
   - Download the `.apk` file
   - Enable "Install from unknown sources" (if needed)
   - Install and open!

---

## 🎯 Run Your App

After installing the build on your device:

```bash
npx expo start --dev-client
```

**Important:** Use `--dev-client` flag (not regular `expo start`)!

Then:
- Open your custom app on your device (NOT Expo Go!)
- Scan the QR code
- Your app loads!

---

## 💡 Why Use npx?

✅ **No installation needed** - avoids permission errors
✅ **Always uses latest version** - npx downloads latest EAS CLI
✅ **Works the same way** - just add `npx eas-cli` instead of `eas`
✅ **No sudo needed** - no permission issues

---

## 📝 All Commands (npx Version)

```bash
# Login
npx eas-cli login

# Configure
npx eas-cli build:configure

# Build iOS
npx eas-cli build --profile development --platform ios

# Build Android
npx eas-cli build --profile development --platform android

# Build both
npx eas-cli build --profile development --platform all

# Check builds
npx eas-cli build:list

# Start dev server
npx expo start --dev-client
```

---

## ✅ That's It!

You don't need to install anything globally. Just use `npx eas-cli` instead of `eas` and you're good to go!

**Ready to build?** Start with Step 1 above! 🚀

