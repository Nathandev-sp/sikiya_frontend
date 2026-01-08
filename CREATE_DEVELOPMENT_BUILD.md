# Creating Your First Development Build 🚀

This guide will walk you through creating development builds for iOS and Android from the same folder.

---

## ✅ Yes! You Can Build Both iOS and Android from the Same Folder!

You can absolutely create both iOS and Android development builds from the same project folder. You can:
- Build iOS only: `eas build --profile development --platform ios`
- Build Android only: `eas build --profile development --platform android`
- Build both at once: `eas build --profile development --platform all`

---

## 📋 Prerequisites Checklist

Before we start, make sure you have:

- [ ] **Expo account** (free) - Sign up at [expo.dev](https://expo.dev) if you don't have one
- [ ] **EAS CLI installed** - We'll check this in Step 1
- [ ] **Your project folder** - You're already in it! ✅
- [ ] **Physical device** (for testing) - Development builds need real devices

---

## 🚀 Step-by-Step Guide

### Step 1: Install EAS CLI (If Not Already Installed)

**Option A: Use npx (Recommended - No Installation Needed!)**

You don't need to install EAS CLI globally! Just use `npx`:

```bash
npx eas-cli --version
```

Then use `npx eas-cli` instead of `eas` for all commands (or see Option B below).

**Option B: Install Globally (If You Prefer)**

Check if you have it:
```bash
eas --version
```

If you get an error, try installing:
```bash
npm install -g eas-cli
```

**If you get permission errors**, you have 3 options:

1. **Use npx (easiest - recommended):**
   - Just use `npx eas-cli` instead of `eas` for all commands
   - No installation needed!

2. **Use sudo (quick fix):**
   ```bash
   sudo npm install -g eas-cli
   ```
   - Enter your Mac password when prompted
   - ⚠️ Note: Using sudo can cause other permission issues later

3. **Fix npm permissions (permanent solution):**
   ```bash
   mkdir ~/.npm-global
   npm config set prefix '~/.npm-global'
   echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.zshrc
   source ~/.zshrc
   npm install -g eas-cli
   ```

---

### Step 2: Login to Expo

**If using npx:**
```bash
npx eas-cli login
```

**If installed globally:**
```bash
eas login
```

This will:
- Ask for your Expo username/email
- Ask for your password
- Log you into your Expo account

**Note:** If you don't have an Expo account, go to [expo.dev](https://expo.dev) and sign up (it's free!).

---

### Step 3: Configure EAS Build (One-Time Setup)

This creates the `eas.json` configuration file:

**If using npx:**
```bash
npx eas-cli build:configure
```

**If installed globally:**
```bash
eas build:configure
```

**What happens:**
- EAS asks you some questions:
  - "Would you like to set up EAS Build?" → **Yes**
  - "What would you like to name your build profile?" → Press Enter (uses "development")
  - "Would you like to configure credentials?" → **Yes** (recommended)
- Creates `eas.json` in your project
- Sets up build profiles

**This only needs to be done once!**

---

### Step 4: Build for iOS

Now let's create your iOS development build:

**If using npx:**
```bash
npx eas-cli build --profile development --platform ios
```

**If installed globally:**
```bash
eas build --profile development --platform ios
```

**What happens:**
1. EAS uploads your project to their servers
2. EAS builds your app in the cloud (takes 10-20 minutes)
3. You'll see progress in the terminal
4. When done, you get a download link

**During the build, EAS might ask:**
- "Do you want to use Expo's managed credentials?" → **Yes** (easiest)
- "Do you want to generate a new Apple certificate?" → **Yes** (if first time)

**After the build completes:**
- You'll get a link like: `https://expo.dev/artifacts/eas/xxxxx.ipa`
- Save this link! You'll need it to install on your iPhone

---

### Step 5: Build for Android (Optional - Same Folder!)

You can build Android from the exact same folder:

**If using npx:**
```bash
npx eas-cli build --profile development --platform android
```

**If installed globally:**
```bash
eas build --profile development --platform android
```

**What happens:**
- Same process as iOS
- Takes 10-20 minutes
- You get a download link for `.apk` file

---

### Step 6: Build Both at Once (Optional)

Want to build both iOS and Android at the same time?

**If using npx:**
```bash
npx eas-cli build --profile development --platform all
```

**If installed globally:**
```bash
eas build --profile development --platform all
```

**What happens:**
- Builds both iOS and Android simultaneously
- Takes about the same time (they build in parallel)
- You get two download links (one for each platform)

---

## 📱 Installing on Your Device

### For iOS:

1. **Get the download link** from the build output
2. **Open the link on your iPhone** (Safari works best)
3. **Download the file** (it will be a `.ipa` file)
4. **Go to Settings → General → VPN & Device Management**
5. **Find your developer name** in the list
6. **Tap it** → **Tap "Trust [Developer Name]"** → **Tap "Trust" again**
7. **Open the app** from your home screen!

### For Android:

1. **Get the download link** from the build output
2. **Open the link on your Android phone**
3. **Download the `.apk` file**
4. **Go to Settings → Security → Enable "Install from unknown sources"** (if not already enabled)
5. **Tap the downloaded `.apk` file**
6. **Tap "Install"**
7. **Open the app!**

---

## 🎯 Running Your App After Installation

Once you've installed the development build on your device:

1. **Start the development server:**
   ```bash
   npx expo start --dev-client
   ```

2. **On your device:**
   - Open your custom app (NOT Expo Go!)
   - Scan the QR code from the terminal
   - Your app loads!

**Important:** Use `--dev-client` flag, not regular `expo start`!

---

## 📊 What Gets Created

After running `eas build:configure`, you'll have:

```
sikiya_frontend/
├── eas.json          ← New file (build configuration)
├── app.json          ← Your existing config
├── package.json      ← Your existing config
└── ... (rest of your files)
```

The `eas.json` file looks like:
```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "production": {
      "distribution": "store"
    }
  }
}
```

---

## ⏱️ Build Times

- **First build**: 15-20 minutes (EAS sets up everything)
- **Subsequent builds**: 10-15 minutes (faster)
- **Both platforms**: Same time (they build in parallel)

---

## 💰 Cost

- **Development builds**: **FREE** (30 builds/month on free tier)
- **Production builds**: FREE to build, but need Apple Developer account ($99/year) to submit to App Store

---

## 🔄 When to Rebuild

You need to rebuild when:
- ✅ **First time** (obviously!)
- ✅ **Adding new native packages** (like `expo-notifications`, `react-native-iap`, etc.)
- ✅ **Changing `app.json` native configuration**
- ✅ **Updating Expo SDK version**

You DON'T need to rebuild for:
- ❌ Regular JavaScript/React code changes (hot reload handles this)
- ❌ UI changes
- ❌ Adding new screens
- ❌ Most app logic changes

---

## 🐛 Troubleshooting

### "EAS CLI not found"
```bash
npm install -g eas-cli
```

### "Not logged in"
```bash
eas login
```

### "No project ID found"
- Make sure you're in the project folder
- Run `eas build:configure` first

### "Build failed"
- Check the error message in the terminal
- Common issues:
  - Missing dependencies
  - Configuration errors in `app.json`
  - Network issues

### "Can't install on iPhone"
- Make sure you trust the developer certificate (Settings → General → VPN & Device Management)
- The certificate expires after 7 days - you'll need to rebuild

---

## 📝 Quick Reference Commands

**Using npx (no installation needed - recommended!):**
```bash
# Login
npx eas-cli login

# Configure (first time only)
npx eas-cli build:configure

# Build iOS
npx eas-cli build --profile development --platform ios

# Build Android
npx eas-cli build --profile development --platform android

# Build both
npx eas-cli build --profile development --platform all

# Start dev server (after installing build)
npx expo start --dev-client

# Check build status
npx eas-cli build:list

# View build details
npx eas-cli build:view [build-id]
```

**If installed globally (replace `npx eas-cli` with `eas`):**
```bash
# Install EAS CLI
npm install -g eas-cli  # or use sudo if permission error

# Login
eas login

# Configure (first time only)
eas build:configure

# Build iOS
eas build --profile development --platform ios

# Build Android
eas build --profile development --platform android

# Build both
eas build --profile development --platform all

# Start dev server (after installing build)
npx expo start --dev-client

# Check build status
eas build:list

# View build details
eas build:view [build-id]
```

---

## 🎉 After Your First Build

Once you have your development build installed:

1. **You can reuse it!** - You don't need to rebuild every time
2. **Just run:** `npx expo start --dev-client`
3. **Make code changes** - They'll hot reload instantly
4. **Only rebuild** when you add new native features

---

## 💡 Pro Tips

1. **Build both platforms at once** if you have both devices:
   ```bash
   eas build --profile development --platform all
   ```

2. **Save your download links** - You might need them later

3. **Check build status online:**
   - Go to [expo.dev](https://expo.dev)
   - Navigate to your project
   - Click "Builds" to see all your builds

4. **Development builds expire:**
   - iOS: Certificate expires after 7 days (need to rebuild)
   - Android: Doesn't expire (can use forever)

5. **You can have multiple builds:**
   - Keep old builds if you want
   - Each build has a unique ID

---

## ✅ Checklist

Before building:
- [ ] EAS CLI installed
- [ ] Logged into Expo (`eas login`)
- [ ] EAS configured (`eas build:configure`)
- [ ] In the correct project folder
- [ ] Have Expo account (free)

Ready to build:
- [ ] Run: `eas build --profile development --platform ios`
- [ ] Wait 10-20 minutes
- [ ] Get download link
- [ ] Install on device
- [ ] Run: `npx expo start --dev-client`
- [ ] Test your app!

---

**Ready to start?** Let's begin with Step 1! 🚀

