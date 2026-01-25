# Apple In-App Purchase Setup Guide - Step by Step

## Overview
This guide walks you through setting up Apple In-App Purchases for Sikiya's contributor subscription. Follow each step carefully.

---

## ⚠️ CRITICAL SAFETY CHECKS IMPLEMENTED

### ✅ The system is now SAFE from:
1. **Paid subscribers being downgraded by trial checker**: 
   - Cron job only downgrades users with `isOnTrial: true` AND `subscriptionStatus: 'none'`
   - Users who pay during trial have `isOnTrial: false` set immediately
   
2. **Subscription expiration handling**:
   - Separate cron job checks paid subscription expiration
   - Middleware checks both trial AND subscription expiration on every request
   - Automatic downgrade when payment fails or expires

---

## PHASE 1: App Store Connect Setup (Apple's Dashboard)

### Step 1.1: Create App Store Connect Account
1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Sign in with your Apple Developer account
3. If you don't have one, enroll at [developer.apple.com](https://developer.apple.com)
   - Cost: $99/year

### Step 1.2: Create Your App in App Store Connect
1. Click **"My Apps"**
2. Click **"+"** → **"New App"**
3. Fill in:
   - **Platform**: iOS
   - **Name**: Sikiya
   - **Primary Language**: English
   - **Bundle ID**: Select your bundle ID (e.g., `com.sikiya.app`)
   - **SKU**: A unique identifier (e.g., `SIKIYA-IOS-001`)
   - **User Access**: Full Access

### Step 1.3: Create Subscription Group
1. In your app page, go to **"Features"** → **"In-App Purchases"**
2. Click **"Manage"** next to Subscriptions
3. Click **"+"** to create a new Subscription Group
4. Name: `Sikiya Premium`
5. Reference Name: `premium_subscription_group`
6. Click **"Create"**

### Step 1.4: Create Subscription Product
1. In your Subscription Group, click **"+"**
2. Select **"Auto-Renewable Subscription"**
3. Fill in details:

**Product Information:**
- **Reference Name**: `Sikiya Contributor Monthly`
- **Product ID**: `com.sikiya.contributor.monthly`
  - ⚠️ **IMPORTANT**: Copy this exact ID - you'll need it later
- **Subscription Duration**: 1 Month

**Subscription Prices:**
- Click **"Add Pricing"**
- Select regions (e.g., United States, Canada, etc.)
- Set price: $4.00 USD
- Apple will auto-convert to other currencies

**Localizations:**
- **Display Name**: `Sikiya Premium`
- **Description**: `Get unlimited commenting and video access with Sikiya Premium. Join meaningful conversations about Africa.`

**App Store Promotion (Optional):**
- **Promotional Image**: Upload a 1024x1024 image
- **Description**: Same as above

4. Click **"Save"**

### Step 1.5: Get Shared Secret
1. In App Store Connect, go to **"My Apps"** → Select your app
2. Go to **"Features"** → **"In-App Purchases"**
3. Click **"App-Specific Shared Secret"**
4. Click **"Generate"**
5. **COPY THIS SECRET** - you'll need it for backend
6. Never share this publicly!

---

## PHASE 2: Backend Configuration

### Step 2.1: Add Environment Variables
Open your backend `.env` file and add:

```bash
# Apple In-App Purchase Configuration
APPLE_SHARED_SECRET=your_app_specific_shared_secret_here
APPLE_PRODUCT_ID=com.sikiya.contributor.monthly
```

Replace `your_app_specific_shared_secret_here` with the secret from Step 1.5.

### Step 2.2: Verify Backend Routes
The backend routes are already set up! No changes needed. Here's what's available:

✅ **POST** `/subscription/ios/verify-receipt`
- Verifies Apple receipt
- Grants contributor role
- Cancels trial if active
- Tracks subscription data

✅ **POST** `/subscription/ios/restore`
- Restores previous purchases
- Verifies receipts
- Reactivates subscription

✅ **GET** `/subscription/status`
- Returns current subscription status

### Step 2.3: Test Backend (Optional)
You can test the backend is ready:

```bash
cd sikiya_backend
node -e "console.log('APPLE_SHARED_SECRET:', process.env.APPLE_SHARED_SECRET ? 'SET ✓' : 'NOT SET ✗')"
```

---

## PHASE 3: Frontend Configuration

### Step 3.1: Install Dependencies
The package is already in `package.json`, but verify:

```bash
cd sikiya_frontend
npm install react-native-iap
```

### Step 3.2: Add Environment Variable
Create/update `.env` file in frontend:

```bash
EXPO_PUBLIC_APPLE_PRODUCT_ID=com.sikiya.contributor.monthly
```

Must match the Product ID from Step 1.4!

### Step 3.3: Link to App Bundle ID
In `app.json`, verify your bundle identifier:

```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.sikiya.app"
    }
  }
}
```

This MUST match what you set in App Store Connect.

---

## PHASE 4: Create Membership/Payment Screen

### Step 4.1: Create MembershipScreen.js
Create file: `src/Screens/UserProfileScreens/MembershipSettingScreen.js`

Update it to include the purchase flow. Here's the key logic:

```javascript
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { initializeIAP, getAvailableProducts, purchaseSubscription, restorePurchases, PRODUCT_IDS } from '../../services/iosIAPService';
import i18n from '../../utils/i18n';

const MembershipSettingScreen = () => {
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState([]);
    const [purchasing, setPurchasing] = useState(false);

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        setLoading(true);
        try {
            await initializeIAP();
            const availableProducts = await getAvailableProducts();
            setProducts(availableProducts);
        } catch (error) {
            console.error('Error loading products:', error);
            Alert.alert('Error', 'Failed to load subscription options');
        } finally {
            setLoading(false);
        }
    };

    const handlePurchase = async () => {
        setPurchasing(true);
        try {
            const result = await purchaseSubscription(PRODUCT_IDS.CONTRIBUTOR_MONTHLY);
            
            if (result.success) {
                Alert.alert(
                    'Success!',
                    'You are now a Sikiya Premium member!',
                    [{ text: 'OK', onPress: () => {
                        // Navigate back or refresh user data
                        navigation.goBack();
                    }}]
                );
            }
        } catch (error) {
            console.error('Purchase error:', error);
            
            if (error.message.includes('cancelled')) {
                // User cancelled, do nothing
            } else {
                Alert.alert('Purchase Failed', error.message);
            }
        } finally {
            setPurchasing(false);
        }
    };

    const handleRestore = async () => {
        setLoading(true);
        try {
            const result = await restorePurchases();
            
            if (result.success) {
                Alert.alert('Success', 'Your subscription has been restored!');
            } else {
                Alert.alert('No Purchases', 'No previous purchases found.');
            }
        } catch (error) {
            console.error('Restore error:', error);
            Alert.alert('Error', 'Failed to restore purchases');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={{ padding: 20 }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
                Upgrade to Premium
            </Text>

            {loading ? (
                <ActivityIndicator size="large" />
            ) : (
                <>
                    {products.map(product => (
                        <View key={product.productId} style={{ marginBottom: 20 }}>
                            <Text style={{ fontSize: 18 }}>{product.title}</Text>
                            <Text>{product.description}</Text>
                            <Text style={{ fontSize: 20, fontWeight: 'bold', marginTop: 10 }}>
                                {product.localizedPrice}/month
                            </Text>
                        </View>
                    ))}

                    <TouchableOpacity
                        onPress={handlePurchase}
                        disabled={purchasing}
                        style={{
                            backgroundColor: '#007AFF',
                            padding: 15,
                            borderRadius: 10,
                            marginBottom: 10
                        }}
                    >
                        {purchasing ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={{ color: 'white', textAlign: 'center', fontSize: 16 }}>
                                Subscribe Now
                            </Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleRestore}
                        disabled={loading}
                        style={{
                            padding: 15,
                            borderRadius: 10
                        }}
                    >
                        <Text style={{ textAlign: 'center', color: '#007AFF' }}>
                            Restore Purchases
                        </Text>
                    </TouchableOpacity>
                </>
            )}
        </View>
    );
};

export default MembershipSettingScreen;
```

### Step 4.2: Navigate to Membership Screen
Update your existing navigation to include this screen or link from Settings.

---

## PHASE 5: Testing

### Step 5.1: Create Sandbox Test Account
1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Click **"Users and Access"**
3. Go to **"Sandbox"** → **"Testers"**
4. Click **"+"** to add a new sandbox tester
5. Fill in:
   - **Email**: Use a fake email (e.g., `test1@sikiya-sandbox.com`)
   - **Password**: Create a password
   - **Country**: Select your country
6. Click **"Create"**

⚠️ **IMPORTANT**: Never use your real Apple ID for testing!

### Step 5.2: Test on Physical Device
You CANNOT test IAP in simulator. You need a physical iPhone/iPad.

1. **Build the app**:
```bash
cd sikiya_frontend
eas build --profile development --platform ios
```

2. **Install on device**:
   - Download the build when ready
   - Install via TestFlight or direct installation

3. **Sign out of your Apple ID**:
   - Settings → [Your Name] → Sign Out
   - Or Settings → App Store → Sign Out

4. **Test the flow**:
   - Open Sikiya app
   - Navigate to Membership/Subscription screen
   - Tap "Subscribe Now"
   - When prompted, sign in with your SANDBOX account
   - Complete the "purchase" (it's free in sandbox)
   - Verify you get contributor role

### Step 5.3: Test Scenarios

✅ **Purchase Flow**:
1. Start with general role
2. Purchase subscription
3. Verify:
   - Alert shows success
   - User gets contributor role
   - Free trial cancelled (if active)
   - Backend logs show subscription activated

✅ **Restore Flow**:
1. Uninstall app
2. Reinstall app
3. Login
4. Tap "Restore Purchases"
5. Verify subscription restored

✅ **Trial + Purchase**:
1. Create new account (gets 7-day trial)
2. Purchase subscription during trial
3. Verify:
   - Trial cancelled immediately
   - Subscription active
   - User keeps contributor role

✅ **Expiration**:
1. In sandbox, subscriptions expire faster (hours instead of months)
2. Wait for expiration
3. Verify user downgraded to general

---

## PHASE 6: App Store Review Preparation

### Step 6.1: Screenshots
Prepare screenshots showing:
1. Subscription screen
2. Premium features
3. Restore purchases option

### Step 6.2: Review Information
In App Store Connect, provide:
- **Sign-in credentials**: Test account for reviewer
- **Notes**: Explain what premium features unlock
- **Demo video** (optional): Show subscription flow

### Step 6.3: Submit for Review
1. Complete app metadata
2. Upload screenshots
3. Set pricing for app (Free)
4. Submit for review

---

## PHASE 7: Production Deployment

### Step 7.1: Update Environment
Change backend `.env` to use production:
```bash
NODE_ENV=production
```

### Step 7.2: Deploy Backend
Deploy to your production server (Render, AWS, etc.)

### Step 7.3: Build Production App
```bash
eas build --profile production --platform ios
```

### Step 7.4: Upload to App Store
```bash
eas submit --platform ios
```

---

## TROUBLESHOOTING

### "No products available"
- Verify Product ID matches exactly
- Check App Store Connect status (should be "Ready to Submit")
- Wait 24 hours after creating products
- Ensure you're using correct Bundle ID

### "Cannot connect to iTunes Store"
- Using simulator (won't work - use real device)
- Not signed out of real Apple ID
- Network issues

### "Receipt verification failed"
- Check APPLE_SHARED_SECRET is correct
- Backend can't reach Apple servers
- Receipt is for wrong environment (sandbox vs production)

### "User not upgraded after purchase"
- Check backend logs for errors
- Verify `/subscription/ios/verify-receipt` endpoint
- Ensure JWT token is valid

### "Trial not cancelled after purchase"
- Check backend sets `isOnTrial: false`
- Verify subscription data saved correctly

---

## MONITORING & MAINTENANCE

### Daily Checks
The cron jobs run automatically:
- **Trial expiration**: Downgrades free trial users at midnight
- **Subscription expiration**: Downgrades users with expired payments

### Manual Checks
Query for active subscriptions:
```javascript
db.user_logins.find({ 
  subscriptionStatus: 'active',
  subscriptionEndDate: { $gt: new Date() }
}).count()
```

Query for subscribers at risk (expiring soon):
```javascript
const threeDaysFromNow = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
db.user_logins.find({ 
  subscriptionStatus: 'active',
  subscriptionEndDate: { $lt: threeDaysFromNow, $gt: new Date() }
})
```

---

## SUMMARY CHECKLIST

### App Store Connect:
- [ ] App created
- [ ] Subscription group created
- [ ] Product created with correct ID
- [ ] Shared secret generated
- [ ] Sandbox test account created

### Backend:
- [ ] APPLE_SHARED_SECRET in .env
- [ ] APPLE_PRODUCT_ID in .env
- [ ] Backend deployed and running

### Frontend:
- [ ] react-native-iap installed
- [ ] EXPO_PUBLIC_APPLE_PRODUCT_ID in .env
- [ ] Membership screen created
- [ ] Purchase flow implemented

### Testing:
- [ ] Tested on real device
- [ ] Purchase works
- [ ] Restore works
- [ ] Trial cancellation works
- [ ] User gets contributor role

### Production:
- [ ] App submitted to App Store
- [ ] Backend in production mode
- [ ] Monitoring set up

---

## NEXT STEPS

After Apple payments work:
1. Add Google Play payments (Android)
2. Add Stripe for web
3. Implement subscription management (cancel, change plan)
4. Add receipt refresh for subscription status checks
5. Implement webhooks for payment failures

---

## SUPPORT CONTACTS

- **Apple Support**: [developer.apple.com/support](https://developer.apple.com/support)
- **IAP Issues**: Check logs in App Store Connect → "Analytics" → "Subscriptions"

Good luck! 🚀
