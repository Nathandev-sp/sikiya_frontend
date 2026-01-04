# Google Play Billing Setup Guide (Android)

This guide explains how to set up Google Play Billing for subscriptions on Android.

---

## 📋 Prerequisites

- ✅ Google Play Console account
- ✅ App registered in Google Play Console
- ✅ Android app created
- ✅ Google Play Developer account ($25 one-time fee)

---

## 🚀 Step-by-Step Setup

### Step 1: Create Your App in Google Play Console

1. Go to [Google Play Console](https://play.google.com/console/)
2. Sign in with your Google account
3. Click **"Create app"**
4. Fill in:
   - **App name**: Sikiya
   - **Default language**: Choose your language
   - **App or game**: App
   - **Free or paid**: Free (with in-app purchases)
   - **Declarations**: Check required boxes
5. Click **"Create app"**

---

### Step 2: Set Up Your App

1. Complete required app details:
   - App access (if restricted)
   - Ads (if applicable)
   - Content rating
   - Target audience
   - Data safety
   - Store listing

2. Note your **Package name** (e.g., `com.sikiya.app`)
   - Must match your Android app's package name

---

### Step 3: Create Subscription Products

1. In Google Play Console, go to your app
2. Click **"Monetize"** → **"Subscriptions"** (in left sidebar)
3. Click **"Create subscription"**

4. Fill in subscription details:

#### Basic Information:
   - **Product ID**: `com.sikiya.contributor.monthly` (must be unique, lowercase, no spaces)
   - **Name**: "Sikiya Contributor" (shown to users)
   - **Description**: 
     ```
     Subscribe to unlock unlimited videos, ad-free experience, 
     full article access, and post comments. 
     Auto-renews monthly.
     ```

#### Pricing:
   - **Base plan**: Create a new base plan
   - **Billing period**: 1 month
   - **Price**: $4.00 USD (or your currency)
   - **Free trial** (optional): Set if you want to offer free trial
   - **Grace period** (optional): Set grace period for failed payments

5. Click **"Save"** → **"Activate"**

---

### Step 4: Configure Subscription Groups

1. In **"Subscriptions"** section, click **"Create subscription group"**
2. Name it: "Sikiya Subscriptions"
3. Add your subscription product to this group
4. This allows users to switch between subscription tiers

---

### Step 5: Set Up Service Account (For Server-Side Validation)

1. Go to **"Setup"** → **"API access"** in Google Play Console
2. Click **"Create new service account"**
3. Follow the link to Google Cloud Console
4. Create a service account:
   - Name: "Sikiya Backend Service Account"
   - Role: Select appropriate role
5. Create and download JSON key file
6. Back in Play Console, click **"Grant access"** to link service account
7. Grant permissions: **"View financial data"**

**Save the JSON key file securely** - you'll need it for backend receipt validation.

---

### Step 6: Get Your Product IDs

After creating subscriptions, note your **Product IDs**:
- `com.sikiya.contributor.monthly` (or whatever you named it)

---

### Step 7: Test Your Subscription

#### Create Test Accounts:

1. Go to **"Monetize"** → **"Subscriptions"** → **"License testing"**
2. Add test email addresses (Gmail accounts)
3. These accounts can test subscriptions without being charged

#### Test in Your App:

1. Build and run your app on an Android device/emulator
2. Sign in with a test account (from License testing)
3. Test the subscription purchase flow
4. In test mode, subscriptions don't charge real money

---

## 📝 Important Notes

### Testing:
- Use **License Testing** accounts for testing (free)
- Test purchases don't charge real money
- Test subscriptions work like real ones

### Production:
- Real users will be charged
- Subscriptions auto-renew
- Handle subscription changes (renewals, cancellations, etc.)

### Receipt Validation:
- Always validate receipts on your backend
- Use Google Play Developer API for server-side validation
- Prevents fraud and ensures security

---

## 📚 Google Documentation

- [Google Play Billing Overview](https://developer.android.com/google/play/billing)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer/)
- [Subscription Best Practices](https://developer.android.com/google/play/billing/subscriptions)

---

## ⚠️ Common Issues

### "Product not found"
- Product ID must match exactly (case-sensitive)
- Subscription must be active in Play Console
- Make sure app is published (at least in Internal Testing)

### "This version of the application is not configured for billing"
- Add billing permission to AndroidManifest.xml
- Make sure your app is uploaded to Play Console
- Verify package name matches

---

## 🎯 Quick Checklist

- [ ] App created in Google Play Console
- [ ] Subscription product created (`com.sikiya.contributor.monthly`)
- [ ] Subscription activated
- [ ] Service account created for backend validation
- [ ] License testers added
- [ ] Product ID noted for code
- [ ] Test purchase works

---

**Note**: For React Native/Expo, you'll use `react-native-iap` or `expo-in-app-purchases` (if available) to integrate Google Play Billing in your app code.

