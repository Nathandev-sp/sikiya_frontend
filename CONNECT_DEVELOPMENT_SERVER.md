# Connecting to Development Server

You're seeing "No development servers found" because your development build app can't connect to the Metro bundler (development server).

---

## 🚀 Quick Fix: Start the Development Server

### Step 1: Start the Dev Server

Open your terminal and run:

```bash
cd /Users/nathancibonga/Desktop/sikiya_frontend
npx expo start --dev-client
```

**Important:** Use `--dev-client` flag (not regular `expo start`)!

### Step 2: Connect Your App

After running the command, you'll see:

```
› Metro waiting on exp://192.168.x.x:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)

› Press a │ open Android
› Press i │ open iOS simulator
› Press w │ open web

› Press r │ reload app
› Press m │ toggle menu
```

**On your iPhone:**
1. Open your **development build app** (the custom app you installed, NOT Expo Go!)
2. The app should automatically detect the server
3. OR scan the QR code with your iPhone camera
4. OR tap "Enter URL manually" and enter: `exp://YOUR_IP:8081`

---

## 🔍 Why This Happens

The development build app needs to connect to:
- **Metro bundler** - The JavaScript bundler that serves your code
- **Development server** - Running on your computer

If the server isn't running, the app can't find it!

---

## 📱 How Development Builds Work

### The Flow:

1. **You start dev server:** `npx expo start --dev-client`
2. **Server runs on your computer** (usually port 8081)
3. **App connects to server** (via Wi-Fi or USB)
4. **App loads your code** from the server
5. **Hot reload works** - Changes appear instantly

### Difference from Expo Go:

- **Expo Go:** Automatically finds servers on the network
- **Development Build:** Needs explicit connection (QR code or URL)

---

## 🛠️ Troubleshooting

### Issue 1: Server Not Starting

**Check:**
- Are you in the correct directory? (`sikiya_frontend`)
- Is port 8081 already in use?
- Try: `npx expo start --dev-client --port 8082`

### Issue 2: App Can't Connect

**Check:**
- **Same Wi-Fi network?** - Phone and computer must be on same Wi-Fi
- **Firewall blocking?** - Allow port 8081 in firewall
- **Try USB connection:**
  ```bash
  npx expo start --dev-client --tunnel
  ```

### Issue 3: Wrong Command

**Don't use:**
- ❌ `npx expo start` (for Expo Go)
- ❌ `npm start` (might not use dev-client)

**Use:**
- ✅ `npx expo start --dev-client` (for development builds)

### Issue 4: Manual Connection

If automatic connection doesn't work:

1. **Get your computer's IP address:**
   - Mac: System Preferences → Network → Wi-Fi → IP Address
   - Or run: `ipconfig getifaddr en0` (Mac)

2. **In the app, tap "Enter URL manually"**

3. **Enter:** `exp://YOUR_IP:8081`
   - Example: `exp://192.168.1.100:8081`

---

## ✅ Step-by-Step Checklist

1. **Open terminal** in your project folder
2. **Run:** `npx expo start --dev-client`
3. **Wait for server to start** (you'll see QR code)
4. **Open your development build app** on iPhone
5. **App should connect automatically** OR scan QR code
6. **Your app loads!**

---

## 🔄 Daily Workflow

### Every Time You Develop:

1. **Start dev server:**
   ```bash
   npx expo start --dev-client
   ```

2. **Open your development build app** on iPhone

3. **App connects and loads**

4. **Make code changes** → See them instantly (hot reload)

5. **When done:** Stop server (Ctrl+C in terminal)

---

## 💡 Pro Tips

### Keep Server Running:
- Leave terminal open while developing
- Server stays running until you stop it (Ctrl+C)
- App reconnects automatically when you reopen it

### Multiple Devices:
- One server can serve multiple devices
- Just scan QR code on each device

### Network Issues:
- Use `--tunnel` flag for better connectivity:
  ```bash
  npx expo start --dev-client --tunnel
  ```

---

## 🎯 Summary

**The Problem:**
- Development build app can't find the Metro bundler
- Server isn't running or can't connect

**The Solution:**
1. Run: `npx expo start --dev-client`
2. Open your development build app
3. Connect (automatic or scan QR code)
4. Start coding!

**Remember:** Always use `--dev-client` flag when working with development builds! 🚀

