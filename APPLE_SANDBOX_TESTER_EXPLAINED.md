# Apple Sandbox Tester Explained

## What is a Sandbox Tester?

A **Sandbox Tester** is a special test account you create in App Store Connect to test In-App Purchases **without using real money**.

Think of it as a "test mode" account for payments.

---

## Why Do You Need It?

### Real Apple ID vs Sandbox Tester:

| Real Apple ID | Sandbox Tester |
|--------------|----------------|
| Uses **real money** 💰 | Uses **fake/test payments** |
| Real subscriptions | Test subscriptions (expire in 5 minutes) |
| Production environment | Sandbox/testing environment |
| Can't be used for testing IAP | Required for testing IAP |

### Why Apple Requires This:

- **Safety**: Prevents accidental real purchases during development
- **Testing**: Allows developers to test payment flows repeatedly
- **Free**: No cost to test (even though it says "purchase", it's free in sandbox)
- **Fast**: Test subscriptions expire quickly (5 minutes) so you can test repeatedly

---

## How Sandbox Works:

### Normal Flow (Production):
```
User → Real Payment → Real Subscription → Real Money
```

### Sandbox Flow (Testing):
```
Sandbox Tester → Fake Payment (FREE) → Test Subscription (5 min) → No Real Money
```

---

## How to Create a Sandbox Tester:

### Step-by-Step:

1. **Go to App Store Connect**:
   - Visit [appstoreconnect.apple.com](https://appstoreconnect.apple.com/)
   - Sign in with your Apple Developer account

2. **Navigate to Sandbox Testers**:
   - Click **"Users and Access"** (in the top menu)
   - Click **"Sandbox Testers"** tab
   - Click **"+"** button (top left)

3. **Fill in Test Account Details**:
   - **Email**: Use any email (doesn't need to be real, but use a format like `test@sikiya.test`)
   - **Password**: Create a password (remember this!)
   - **First Name**: Any name (e.g., "Test")
   - **Last Name**: Any name (e.g., "User")
   - **Country/Region**: Choose your test region (e.g., "United States")
   - **Date of Birth**: Any date (must be 18+)

4. **Click "Invite"**

5. **Done!** The test account is ready to use.

---

## How to Use Sandbox Tester:

### On Your Test Device:

1. **Sign out of your real Apple ID**:
   - Go to Settings → [Your Name] → Sign Out
   - (Important: You can't be signed in to a real Apple ID)

2. **Run your app** (in development build)

3. **When you try to purchase**:
   - Apple will prompt you to sign in
   - **Use your Sandbox Tester credentials** (the email/password you just created)

4. **Complete the "purchase"**:
   - It says "purchase" but it's **FREE** (no real money)
   - The subscription will be created
   - It expires in **5 minutes** (for testing)

5. **Test again**:
   - After 5 minutes, the subscription expires
   - You can test the purchase flow again
   - No limits on how many times you can test

---

## Important Notes:

### ✅ Do's:
- ✅ Create multiple test accounts if needed
- ✅ Use test emails (like `test1@sikiya.test`, `test2@sikiya.test`)
- ✅ Sign out of real Apple ID before testing
- ✅ Use Sandbox Testers only for development/testing

### ❌ Don'ts:
- ❌ Don't use your real Apple ID for testing (won't work)
- ❌ Don't use real email addresses you use elsewhere
- ❌ Don't use Sandbox Tester in production (won't work)
- ❌ Don't stay signed in to Sandbox Tester after testing (sign back into real Apple ID)

---

## Example Scenario:

### Testing Your $4.00/Month Subscription:

1. **Create Sandbox Tester**: `test@sikiya.test` / `password123`

2. **On your iPhone**:
   - Sign out of your real Apple ID
   - Install your development build
   - Open the app

3. **Try to subscribe**:
   - Tap "Upgrade to Contributor"
   - Apple prompts: "Sign in to App Store"
   - Enter: `test@sikiya.test` / `password123`
   - Tap "Buy" (it's FREE in sandbox!)

4. **Subscription Active**:
   - User role changes to "contributor"
   - Subscription shows as active
   - **Expires in 5 minutes** (for testing)

5. **Test Again**:
   - After 5 minutes, subscription expires
   - User role goes back to "general"
   - You can test the purchase flow again

---

## Multiple Test Accounts:

You can create multiple Sandbox Testers:

- `test1@sikiya.test` - For testing new subscriptions
- `test2@sikiya.test` - For testing renewals
- `test3@sikiya.test` - For testing cancellations

Each can have different subscription states for testing different scenarios.

---

## Sandbox vs Production:

### Sandbox (Testing):
- ✅ Free (no real money)
- ✅ Subscriptions expire in 5 minutes
- ✅ Use Sandbox Tester accounts
- ✅ For development/testing only
- ✅ Can test unlimited times

### Production (Real):
- 💰 Uses real money
- 📅 Real subscription durations (1 month, etc.)
- 👤 Uses real Apple IDs
- 🌐 For actual users
- ⚠️ Real purchases, real charges

---

## Common Questions:

### Q: Do I need a credit card for Sandbox Tester?
**A:** No! Sandbox purchases are completely free.

### Q: Can I use my real Apple ID?
**A:** No, you must use a Sandbox Tester account. Real Apple IDs won't work for testing IAP.

### Q: How long do sandbox subscriptions last?
**A:** They expire in 5 minutes (for testing purposes).

### Q: Can I create multiple test accounts?
**A:** Yes! Create as many as you need for different testing scenarios.

### Q: Will Sandbox Testers work in production?
**A:** No, Sandbox Testers only work in sandbox/test environments.

---

## Summary:

**Sandbox Tester = Free test account for testing payments**

- Create in App Store Connect → Users and Access → Sandbox Testers
- Use when testing In-App Purchases
- Completely free (no real money)
- Subscriptions expire in 5 minutes
- Required for testing (can't use real Apple IDs)

**Think of it as a "test mode" for payments!** 🧪

