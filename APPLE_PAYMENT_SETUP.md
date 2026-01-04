# Apple In-App Purchase Setup Guide

This guide walks you through setting up Apple In-App Purchases (IAP) for subscriptions in the Sikiya app.

---

## 📋 Prerequisites

- ✅ Apple Developer Account (you have this!)
- ✅ App registered in App Store Connect
- ✅ App ID configured with In-App Purchase capability
- ✅ Bundle ID matches your app

---

## 🚀 Step-by-Step Setup

### Step 1: Create Your App in App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com/)
2. Sign in with your Apple Developer account
3. Click **"My Apps"** → **"+"** → **"New App"**
4. Fill in:
   - **Platform**: iOS
   - **Name**: Sikiya (or your app name)
   - **Primary Language**: Choose your language
   - **Bundle ID**: Select your app's bundle ID (must match your app)
   - **SKU**: Unique identifier (e.g., `com.sikiya.app`)
   - **User Access**: Full Access (for subscription management)

5. Click **"Create"**

---

### Step 2: Enable In-App Purchase Capability

#### In Xcode:

1. Open your project in Xcode (or configure in `app.json` for Expo)
2. Select your target → **"Signing & Capabilities"**
3. Click **"+ Capability"**
4. Add **"In-App Purchase"**

#### For Expo (app.json):

Add to your `app.json`:

```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.yourcompany.sikiya",
      "supportsTablet": true
    }
  }
}
```

**Note**: For Expo, you'll need to configure this in your native iOS project after running `npx expo prebuild` or creating a development build.

---

### Step 3: Create Subscription Products in App Store Connect

1. In App Store Connect, go to your app
2. Click **"Features"** → **"In-App Purchases"**
3. Click **"+"** → **"Auto-Renewable Subscription"**

4. Fill in the subscription details:

#### Subscription Information:
   - **Reference Name**: `Sikiya Contributor Monthly` (internal name, not shown to users)
   - **Product ID**: `com.sikiya.contributor.monthly` (must be unique, use reverse domain notation)
   - **Subscription Group**: Create a new group (e.g., "Sikiya Subscriptions")

5. Click **"Create"**

---

### Step 4: Configure Subscription Details

#### Subscription Duration:
   - Select: **1 Month**

#### Pricing:
   - Select your price tier (e.g., **Tier 1: $0.99** or **Tier 5: $4.99**)
   - For $4.00/month, choose the closest tier (likely **Tier 4: $3.99** or **Tier 5: $4.99**)
   - Apple will show prices in all countries automatically

#### Subscription Group:
   - Create a new group: **"Sikiya Subscriptions"**
   - This allows users to switch between subscription tiers

#### Localizations:
   - Add localized names and descriptions:
     - **Display Name**: "Sikiya Contributor"
     - **Description**: 
       ```
       Subscribe to unlock unlimited videos, ad-free experience, 
       full article access, and post comments. 
       Auto-renews monthly.
       ```

---

### Step 5: Configure Subscription Group

1. In your subscription group, you can add multiple subscription tiers (if needed)
2. Set the **"Group Level Display Name"**: "Sikiya Membership"
3. For now, you only need one subscription (Contributor tier)

---

### Step 6: Set Up App Store Connect API (Optional but Recommended)

For server-side receipt validation:

1. Go to **"Users and Access"** in App Store Connect
2. Click **"Keys"** tab
3. Click **"Generate API Key"**
4. Name it: "Sikiya Backend API Key"
5. Select **"App Manager"** role
6. Click **"Generate"**
7. **Download the key file** (`.p8` file - you can only download once!)
8. Save the **Key ID** and **Issuer ID**

**Keep these safe** - you'll need them for server-side receipt validation.

---

### Step 7: Get Your Product IDs

After creating your subscription:

1. Note your **Product ID**: `com.sikiya.contributor.monthly` (or whatever you chose)
2. This will be used in your app code to initiate purchases

---

### Step 8: Configure Your App Code

#### Environment Variables:

Add to your `.env` file:

```env
# Apple In-App Purchase
EXPO_PUBLIC_APPLE_PRODUCT_ID=com.sikiya.contributor.monthly
EXPO_PUBLIC_APPLE_SHARED_SECRET=your_shared_secret_here
```

#### Get Shared Secret:

1. Go to **App Store Connect** → Your App → **"App Information"**
2. Scroll to **"App-Specific Shared Secret"**
3. Click **"Generate"** (if not already generated)
4. Copy the secret and add to your `.env`

---

### Step 9: Install Required Packages

For Expo, you'll need `expo-in-app-purchases`:

```bash
cd "Sikiya Frontend"
npx expo install expo-in-app-purchases
```

**⚠️ Important**: This requires a **development build** (NOT Expo Go).

**You CANNOT test Apple payments in Expo Go!**

You must:
1. Create a development build: `eas build --profile development --platform ios`
2. Install on device
3. Run with: `npx expo start --dev-client`

See `APPLE_PAYMENT_TESTING.md` for detailed testing instructions.

---

### Step 10: Test Your Subscription

#### Create Sandbox Tester:

A **Sandbox Tester** is a special test account for testing payments **without using real money**. Think of it as a "test mode" account.

1. Go to **App Store Connect** → **"Users and Access"** → **"Sandbox Testers"**
2. Click **"+"** to add a test user
3. Fill in:
   - **Email**: Use a test email (e.g., `test@sikiya.test` - doesn't need to be real)
   - **Password**: Create a password (remember this!)
   - **Country/Region**: Choose your test region (e.g., "United States")
   - **First Name / Last Name**: Any name (e.g., "Test User")
   - **Date of Birth**: Any date (must be 18+)
4. Click **"Invite"**

**Important**: 
- Sandbox purchases are **FREE** (no real money)
- Subscriptions expire in **5 minutes** (for testing)
- You must sign out of your real Apple ID before testing
- See `APPLE_SANDBOX_TESTER_EXPLAINED.md` for detailed explanation

#### Test in Your App:

**⚠️ You MUST use a development build (not Expo Go)!**

1. Create development build: `eas build --profile development --platform ios`
2. Install the build on your device
3. Run: `npx expo start --dev-client`
4. When prompted to sign in, use your **Sandbox Tester** credentials
5. Test the subscription purchase flow
6. In sandbox, subscriptions expire in 5 minutes (for testing)

**See `APPLE_PAYMENT_TESTING.md` for complete testing setup instructions.**

---

## 📝 Important Notes

### Subscription Status:

- **Sandbox**: Test environment, subscriptions expire quickly
- **Production**: Real environment, real payments, real subscriptions

### Receipt Validation:

For production, you should validate receipts on your backend to:
- Prevent fraud
- Verify subscription status
- Handle subscription changes (renewals, cancellations, etc.)

### App Store Review:

Before going live:
1. Submit your app for review with In-App Purchase enabled
2. Apple will review your subscription setup
3. Make sure subscription terms are clear to users
4. Include a link to your terms of service and privacy policy

---

## 🔧 Next Steps in Your Code

Once you have your Product ID, you'll need to:

1. **Update your payment service** to handle Apple IAP
2. **Update subscription routes** to validate Apple receipts
3. **Handle subscription status** in your app
4. **Set up webhooks** for subscription events (optional, but recommended)

---

## 📚 Apple Documentation

- [In-App Purchase Overview](https://developer.apple.com/in-app-purchase/)
- [StoreKit 2 Documentation](https://developer.apple.com/documentation/storekit)
- [App Store Connect Help](https://help.apple.com/app-store-connect/)
- [Testing In-App Purchases](https://developer.apple.com/documentation/storekit/in-app_purchase/testing_in-app_purchases_with_sandbox)

---

## ⚠️ Common Issues

### "Cannot connect to iTunes Store"
- Make sure you're signed in with a Sandbox Tester account
- Check your device/simulator network connection
- Verify your Product ID is correct

### "Product not found"
- Make sure the Product ID matches exactly (case-sensitive)
- Ensure the subscription is approved/ready for sale in App Store Connect
- For sandbox, make sure you're using a Sandbox Tester account

### "Invalid receipt"
- Check your receipt validation code
- Make sure you're using the correct environment (sandbox vs production)
- Verify your shared secret is correct

---

## 🎯 Quick Checklist

- [ ] App created in App Store Connect
- [ ] In-App Purchase capability enabled
- [ ] Subscription product created (`com.sikiya.contributor.monthly`)
- [ ] Subscription configured (duration, price, description)
- [ ] Shared secret generated
- [ ] Product ID noted for code
- [ ] Sandbox testers created
- [ ] Code updated with Product ID
- [ ] Test purchase works in sandbox
- [ ] Receipt validation set up on backend

---

**Once you complete these steps, you'll be ready to integrate Apple payments into your app!** 🚀

