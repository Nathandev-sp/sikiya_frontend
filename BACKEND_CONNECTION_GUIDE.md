# Backend Connection Guide for Development Builds

This guide explains how your development build connects to your backend server.

---

## 🔌 The Problem

When you run your app on a **physical device**, `localhost:3000` won't work because:
- `localhost` refers to the device itself, not your computer
- Your phone/tablet can't access your computer's `localhost`

---

## ✅ Solutions

You have **3 options** depending on your setup:

### Option 1: Use Your Local Network IP (Recommended for Development)

**Best for:** Testing on physical devices on the same Wi-Fi network

#### Step 1: Find Your Computer's Local IP

**Mac/Linux:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**Windows:**
```cmd
ipconfig
```
Look for "IPv4 Address" (usually starts with `192.168.x.x` or `10.0.x.x`)

#### Step 2: Update Your `.env` File

In `Sikiya Frontend/.env`:
```env
EXPO_PUBLIC_API_URL=http://192.168.1.100:3000
```
Replace `192.168.1.100` with your actual local IP address.

#### Step 3: Make Sure Backend is Running

```bash
cd "Sikiya Backend"
npm start
# or
npm run dev
```

#### Step 4: Restart Expo Dev Server

```bash
cd "Sikiya Frontend"
npx expo start --dev-client
```

**Pros:**
- ✅ Fast (no internet required)
- ✅ Free
- ✅ Works with development builds
- ✅ Good for local testing

**Cons:**
- ❌ Only works on same Wi-Fi network
- ❌ IP changes if you switch networks
- ❌ Not accessible from outside your network

---

### Option 2: Use ngrok (Recommended for Testing from Anywhere)

**Best for:** Testing from anywhere, sharing with team, testing on different networks

#### Step 1: Install ngrok

```bash
# Mac (with Homebrew)
brew install ngrok

# Or download from https://ngrok.com/download
```

#### Step 2: Create Free ngrok Account

1. Sign up at [ngrok.com](https://ngrok.com) (free)
2. Get your authtoken from dashboard
3. Configure: `ngrok config add-authtoken YOUR_TOKEN`

#### Step 3: Start Backend Server

```bash
cd "Sikiya Backend"
npm start
```

#### Step 4: Start ngrok Tunnel

```bash
ngrok http 3000
```

This gives you a URL like: `https://abc123.ngrok-free.app`

#### Step 5: Update Your `.env` File

In `Sikiya Frontend/.env`:
```env
EXPO_PUBLIC_API_URL=https://abc123.ngrok-free.app
```
Use the HTTPS URL from ngrok (not the HTTP one).

#### Step 6: Restart Expo Dev Server

```bash
cd "Sikiya Frontend"
npx expo start --dev-client
```

**Pros:**
- ✅ Works from anywhere (internet connection required)
- ✅ Shareable URL for team testing
- ✅ HTTPS (secure)
- ✅ Free tier available

**Cons:**
- ❌ URL changes each time (unless you have paid plan)
- ❌ Requires internet connection
- ❌ Slightly slower than local network

**Note:** Free ngrok URLs change each time you restart. For development, this is usually fine. If you need a stable URL, consider ngrok's paid plan or Option 3.

---

### Option 3: Deploy Backend to Production Server

**Best for:** Production testing, stable URLs, team collaboration

Deploy your backend to:
- **Heroku** (free tier available)
- **Railway** (free tier available)
- **Render** (free tier available)
- **AWS/DigitalOcean** (paid)
- **Any VPS/hosting provider**

Then update your `.env`:
```env
EXPO_PUBLIC_API_URL=https://your-backend-domain.com
```

**Pros:**
- ✅ Stable URL (doesn't change)
- ✅ Works from anywhere
- ✅ Production-like environment
- ✅ Can share with team easily

**Cons:**
- ❌ Requires hosting setup
- ❌ May have costs (some free tiers available)
- ❌ Slower development iteration

---

## 🎯 Recommended Setup for Development

**For local development on physical devices:**

1. **Start with Option 1 (Local Network IP)**
   - Fastest for daily development
   - No setup needed beyond finding your IP
   - Works great on same Wi-Fi

2. **Use Option 2 (ngrok) when:**
   - Testing from different networks
   - Sharing with team members
   - Testing on cellular data
   - Need HTTPS for certain features

3. **Use Option 3 (Deployed Server) for:**
   - Production testing
   - Demo/testing builds
   - Team-wide testing

---

## 📝 Quick Setup Checklist

### For Local Network IP (Option 1):

- [ ] Find your computer's local IP address
- [ ] Update `Sikiya Frontend/.env` with `EXPO_PUBLIC_API_URL=http://YOUR_IP:3000`
- [ ] Make sure backend is running on port 3000
- [ ] Ensure device and computer are on same Wi-Fi
- [ ] Restart Expo dev server

### For ngrok (Option 2):

- [ ] Install ngrok
- [ ] Sign up for ngrok account
- [ ] Configure authtoken
- [ ] Start backend server (`npm start`)
- [ ] Start ngrok (`ngrok http 3000`)
- [ ] Copy HTTPS URL from ngrok
- [ ] Update `Sikiya Frontend/.env` with ngrok URL
- [ ] Restart Expo dev server

---

## 🔄 Switching Between Options

You can easily switch by updating your `.env` file:

```env
# Option 1: Local Network
EXPO_PUBLIC_API_URL=http://192.168.1.100:3000

# Option 2: ngrok
EXPO_PUBLIC_API_URL=https://abc123.ngrok-free.app

# Option 3: Production
EXPO_PUBLIC_API_URL=https://api.sikiya.com
```

**Remember to restart the Expo dev server after changing `.env`!**

---

## ⚠️ Important Notes

1. **Development builds use the same connection methods as Expo Go**
   - The connection method doesn't change
   - Only the app container changes (dev build vs Expo Go)

2. **Environment variables**
   - Use `EXPO_PUBLIC_API_URL` in your `.env` file
   - Expo automatically loads these variables
   - Restart dev server after changing `.env`

3. **Backend must be running**
   - Always make sure your backend is running before testing
   - Check backend logs for connection attempts

4. **CORS configuration**
   - Your backend should already have CORS configured
   - Make sure it allows requests from your app's origin

---

## 🚨 Troubleshooting

### "Network Error" or "Connection Refused"

1. **Check backend is running:**
   ```bash
   cd "Sikiya Backend"
   npm start
   ```

2. **Verify URL in `.env` is correct:**
   - Check for typos
   - Make sure it includes `http://` or `https://`
   - Verify port number (usually `:3000`)

3. **For local network IP:**
   - Ensure device and computer on same Wi-Fi
   - Check firewall isn't blocking port 3000
   - Verify IP address hasn't changed

4. **For ngrok:**
   - Make sure ngrok is running
   - Use HTTPS URL (not HTTP)
   - Check ngrok dashboard for active tunnels

### "Cannot connect to server"

- Check backend logs for errors
- Verify backend is accessible from browser: `http://YOUR_URL/api-endpoint`
- Test with a simple endpoint first

---

## 📚 Summary

**You don't need to host your server for development builds**, but `localhost:3000` won't work on physical devices.

**Recommended approach:**
- **Development:** Use local network IP (Option 1) or ngrok (Option 2)
- **Production:** Deploy backend to a hosting service (Option 3)

**ngrok is still useful** for development, especially when:
- Testing from different networks
- Sharing with team
- Need a stable URL for testing

Choose the option that best fits your development workflow! 🚀


