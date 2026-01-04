# Testing Apple Payments - Expo Guide

## ❌ Can You Test in Expo Go?

**No, you CANNOT test Apple In-App Purchases in Expo Go.**

### Why Not?

Expo Go only includes a limited set of pre-installed Expo modules. In-App Purchases require:
- Native iOS code (StoreKit framework)
- Custom native modules
- App Store Connect integration

These features are **not available in Expo Go**.

---

## ✅ How to Test Apple Payments

You have **2 options**:

### Option 1: Development Build (Recommended)

Create a **custom development client** that includes your native modules.

#### Steps:

1. **Install EAS CLI** (if not already installed):
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo**:
   ```bash
   eas login
   ```

3. **Configure EAS Build**:
   ```bash
   cd "Sikiya Frontend"
   eas build:configure
   ```
   
   This creates `eas.json` in your project.

4. **Install the payment package**:
   ```bash
   npx expo install expo-in-app-purchases
   ```

5. **Create Development Build**:
   ```bash
   # For iOS
   eas build --profile development --platform ios
   ```
   
   This builds a custom development client with your native modules.

6. **Install on Device**:
   - EAS will provide a download link
   - Install on your iPhone/iPad
   - OR use TestFlight for easier distribution

7. **Run Your App**:
   ```bash
   npx expo start --dev-client
   ```
   
   Your app will run in the custom development client (not Expo Go).

#### Advantages:
- ✅ Includes all native modules (including IAP)
- ✅ Hot reload works
- ✅ Fast iteration
- ✅ Can test on physical devices
- ✅ Can use TestFlight for team testing

#### Disadvantages:
- ⏳ First build takes 10-20 minutes
- 📱 Requires physical device or TestFlight
- 💰 Uses EAS Build minutes (free tier: 30 builds/month)

---

### Option 2: Production Build (For Final Testing)

Create a production build and install via TestFlight.

#### Steps:

1. **Create Production Build**:
   ```bash
   eas build --profile production --platform ios
   ```

2. **Submit to TestFlight**:
   ```bash
   eas submit --platform ios
   ```
   
   OR manually upload in App Store Connect.

3. **Test in TestFlight**:
   - Install TestFlight app on your device
   - Accept invitation (if using internal testing)
   - Install your app
   - Test payments

#### Advantages:
- ✅ Production-like environment
- ✅ Can test with real App Store accounts
- ✅ Good for final testing before release

#### Disadvantages:
- ❌ No hot reload (need to rebuild for changes)
- ❌ Slower iteration
- ❌ Requires App Store Connect setup

---

## 🎯 Recommended Testing Flow

### Phase 1: Development (Fast Iteration)
1. Create development build
2. Install on device
3. Use `expo start --dev-client`
4. Test payment flow
5. Iterate quickly with hot reload

### Phase 2: Pre-Production (Final Testing)
1. Create production build
2. Submit to TestFlight
3. Test with sandbox accounts
4. Verify everything works

### Phase 3: Production (Release)
1. Submit to App Store
2. Get approval
3. Release to users

---

## 📝 Quick Setup for Development Build

### 1. Install Packages:
```bash
cd "Sikiya Frontend"
npx expo install expo-in-app-purchases
```

### 2. Configure EAS (if not done):
```bash
eas build:configure
```

### 3. Build Development Client:
```bash
eas build --profile development --platform ios
```

### 4. Install on Device:
- Download from EAS dashboard
- Install on iPhone/iPad
- Trust developer certificate (Settings → General → VPN & Device Management)

### 5. Run Development Server:
```bash
npx expo start --dev-client
```

### 6. Scan QR Code:
- Open your custom development client (not Expo Go!)
- Scan QR code from terminal
- Your app loads with IAP support!

---

## ⚠️ Important Notes

### Sandbox Testing:
- **Always use Sandbox Testers** for testing (not real Apple IDs)
- Sandbox subscriptions expire in **5 minutes** (for testing)
- Sandbox environment is separate from production

### Testing Checklist:
- [ ] Development build created and installed
- [ ] Sandbox tester account created in App Store Connect
- [ ] Signed out of real Apple ID on test device
- [ ] Can initiate purchase flow
- [ ] Receipt validation works
- [ ] Subscription status updates correctly
- [ ] User role updates after purchase

### Common Issues:

**"Cannot connect to iTunes Store"**
- Make sure you're using a Sandbox Tester account
- Check internet connection
- Verify Product ID is correct

**"Product not found"**
- Product ID must match exactly (case-sensitive)
- Product must be approved/ready in App Store Connect
- Make sure you're using Sandbox Tester account

**"App crashes on purchase"**
- Check that `expo-in-app-purchases` is properly installed
- Verify you're using development build (not Expo Go)
- Check console logs for errors

---

## 💡 Pro Tip

You can create **multiple development builds** for different team members:
- Each team member gets their own build
- All can test simultaneously
- Free tier: 30 builds/month (should be plenty for development)

---

## Summary

❌ **Expo Go**: Cannot test IAP  
✅ **Development Build**: Can test IAP (recommended for development)  
✅ **Production Build + TestFlight**: Can test IAP (recommended for final testing)

**For development, use Option 1 (Development Build)** - it's the fastest way to test and iterate! 🚀

