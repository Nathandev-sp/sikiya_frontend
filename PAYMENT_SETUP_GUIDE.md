# Payment Method Setup Guide

This guide explains how to configure the payment systems for iOS and Android.

## Overview

- **iOS**: Uses Apple In-App Purchases (IAP) via `react-native-iap`
- **Android**: Uses Stripe via `@stripe/stripe-react-native`

## iOS Setup (Apple In-App Purchases)

### Step 1: Configure App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com/)
2. Navigate to your app → **Features** → **In-App Purchases**
3. Create a subscription product:
   - Product ID: `com.sikiya.contributor.monthly` (or your preferred ID)
   - Type: Auto-Renewable Subscription
   - Set pricing and subscription duration
   - Create subscription groups if needed

### Step 2: Update Product IDs

Edit `src/services/iosIAPService.js`:

```javascript
const PRODUCT_IDS = {
    CONTRIBUTOR_MONTHLY: 'com.sikiya.contributor.monthly', // Replace with your actual product ID
};
```

### Step 3: Configure iOS Project

1. Open your iOS project in Xcode
2. Go to **Capabilities** tab
3. Enable **In-App Purchase**
4. Ensure your App Store Connect account is linked

### Step 4: Testing

1. Create a sandbox test account in App Store Connect
2. Sign out of your Apple ID on the test device
3. When prompted during purchase, use the sandbox account
4. Test subscription flow, restoration, and cancellation

### Step 5: Backend Integration

When a purchase is successful, you need to:
1. Verify the receipt with Apple's servers
2. Update the user's subscription status in your database
3. Call `finishTransaction()` to complete the purchase

**Example backend endpoint:**
```javascript
// POST /api/verify-ios-purchase
// Body: { receiptData, productId }
// Verify with Apple: https://buy.itunes.apple.com/verifyReceipt
```

## Android Setup (Stripe)

### Step 1: Create Stripe Account

1. Sign up at [Stripe Dashboard](https://dashboard.stripe.com/)
2. Get your **Publishable Key** from API Keys section
3. Keep your **Secret Key** secure (only use on backend)

### Step 2: Update Stripe Key

Edit `src/services/stripeService.js`:

```javascript
const STRIPE_PUBLISHABLE_KEY = 'pk_test_...'; // Replace with your key
```

### Step 3: Backend Setup

You need to create backend endpoints for:

#### 3.1 Create Payment Intent
```javascript
// POST /api/create-payment-intent
// Body: { amount, currency }
// Returns: { clientSecret }

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

app.post('/api/create-payment-intent', async (req, res) => {
  const { amount, currency } = req.body;
  
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency,
    // Add metadata for user tracking
  });
  
  res.json({ clientSecret: paymentIntent.client_secret });
});
```

#### 3.2 Create Setup Intent (for saving cards)
```javascript
// POST /api/create-setup-intent
// Returns: { clientSecret }

app.post('/api/create-setup-intent', async (req, res) => {
  const setupIntent = await stripe.setupIntents.create({
    payment_method_types: ['card'],
  });
  
  res.json({ clientSecret: setupIntent.client_secret });
});
```

#### 3.3 Get Payment Methods
```javascript
// GET /api/payment-methods
// Returns: { paymentMethods: [...] }

app.get('/api/payment-methods', async (req, res) => {
  const customerId = req.user.stripeCustomerId; // Get from your DB
  
  const paymentMethods = await stripe.paymentMethods.list({
    customer: customerId,
    type: 'card',
  });
  
  res.json({ paymentMethods: paymentMethods.data });
});
```

#### 3.4 Delete Payment Method
```javascript
// DELETE /api/payment-methods/:id

app.delete('/api/payment-methods/:id', async (req, res) => {
  await stripe.paymentMethods.detach(req.params.id);
  res.json({ success: true });
});
```

#### 3.5 Set Default Payment Method
```javascript
// POST /api/payment-methods/:id/set-default

app.post('/api/payment-methods/:id/set-default', async (req, res) => {
  const customerId = req.user.stripeCustomerId;
  
  await stripe.customers.update(customerId, {
    invoice_settings: {
      default_payment_method: req.params.id,
    },
  });
  
  res.json({ success: true });
});
```

### Step 4: Update Backend URLs

Edit `src/services/stripeService.js` and replace:
- `https://your-backend.com/api/...` with your actual backend URLs
- Add authentication headers (JWT tokens, etc.)

### Step 5: Implement Card Collection UI

Currently, the form uses basic TextInput. For production, you should use Stripe's `CardField` component:

```javascript
import { CardField } from '@stripe/stripe-react-native';

// Replace the card input form with:
<CardField
  postalCodeEnabled={true}
  placeholders={{
    number: '4242 4242 4242 4242',
  }}
  cardStyle={{
    backgroundColor: '#FFFFFF',
    textColor: '#000000',
  }}
  style={styles.cardField}
  onCardChange={(cardDetails) => {
    // Handle card details
  }}
/>
```

### Step 6: Testing

1. Use Stripe test cards:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
   - 3D Secure: `4000 0025 0000 3155`
2. Test in Stripe test mode first
3. Monitor webhooks in Stripe Dashboard

## Security Notes

1. **Never expose secret keys** in frontend code
2. Always verify payments on your backend
3. Use HTTPS for all API calls
4. Implement proper authentication/authorization
5. Store sensitive data securely (use environment variables)

## Next Steps

1. ✅ UI is implemented and ready
2. ⏳ Configure App Store Connect (iOS)
3. ⏳ Set up Stripe account and get keys (Android)
4. ⏳ Create backend endpoints
5. ⏳ Update service files with actual keys/URLs
6. ⏳ Test on real devices
7. ⏳ Handle webhooks for subscription events

## Troubleshooting

### iOS Issues
- **"No products found"**: Check product IDs match App Store Connect
- **"Purchase failed"**: Ensure device is signed in with sandbox account
- **"Connection error"**: Check internet connection and IAP initialization

### Android Issues
- **"Stripe not initialized"**: Check publishable key is correct
- **"Payment failed"**: Verify backend endpoints are working
- **"Card declined"**: Use test cards in test mode

## Resources

- [react-native-iap Documentation](https://react-native-iap.hyo.dev/)
- [Stripe React Native SDK](https://stripe.com/docs/payments/accept-a-payment?platform=react-native)
- [Apple In-App Purchase Guide](https://developer.apple.com/in-app-purchase/)
- [Stripe API Reference](https://stripe.com/docs/api)






