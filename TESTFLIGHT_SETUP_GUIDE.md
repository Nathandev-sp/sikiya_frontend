# TestFlight Setup Guide - Using Your Paid Apple Developer Account

Since you already have a paid Apple Developer account ($99/year), you can absolutely use TestFlight! Here's how to set it up.

---

## ✅ Yes, You Can Use TestFlight!

With a paid Apple Developer account, you can:
- ✅ Use TestFlight for beta testing
- ✅ Share with up to 10,000 testers
- ✅ No expiration (unlike development builds)
- ✅ Professional distribution
- ✅ Automatic updates for testers

---

## 🚀 Setting Up TestFlight

### Step 1: Create App in App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com/)
2. Sign in with your Apple Developer account
3. Click **"My Apps"** → **"+"** → **"New App"**
4. Fill in:
   - **Platform**: iOS
   - **Name**: Sikiya
   - **Primary Language**: Your language
   - **Bundle ID**: Select `com.sikiya.app` (or create it if it doesn't exist)
   - **SKU**: `com.sikiya.app` (or any unique identifier)
   - **User Access**: Full Access
5. Click **"Create"**

---

### Step 2: Build Production Version

Build a production build (not development build):

```bash
npx eas-cli build --profile production --platform ios
```

**What's different from development build:**
- Uses production certificates (don't expire)
- Optimized for App Store
- Can be submitted to TestFlight

**Build time:** 15-30 minutes

---

### Step 3: Submit to TestFlight

After build completes, submit it:

```bash
npx eas-cli submit --platform ios
```

**OR manually:**
1. Go to [App Store Connect](https://appstoreconnect.apple.com/)
2. Select your app
3. Go to **TestFlight** tab
4. Click **"+"** to add build
5. Upload your `.ipa` file (from EAS build)

**Processing time:** 30-60 minutes (Apple processes the build)

---

### Step 4: Add Testers

#### Internal Testers (Up to 100):
1. Go to **TestFlight** → **Internal Testing**
2. Click **"+"** to add testers
3. Add email addresses of people on your team
4. They get invite email immediately

#### External Testers (Up to 10,000):
1. Go to **TestFlight** → **External Testing**
2. Click **"+"** to add testers
3. Add email addresses
4. **First time:** Needs App Review (can take 24-48 hours)
5. After approval: Testers get invite email

---

### Step 5: Testers Install

1. Testers download **"TestFlight"** app from App Store (free)
2. They get invite email
3. They tap the link in email
4. TestFlight opens
5. They tap **"Install"**
6. App installs on their device
7. They can test!

---

## 🔄 Transferring from Personal to Company Account

### Current Situation:
- ✅ You have personal Apple Developer account ($99/year)
- ✅ You're using it for Sikiya
- ⚠️ You plan to transfer to company account later

### What You Need to Know:

#### Option 1: Keep Using Personal Account (Easier)
- ✅ **Simpler**: No transfer needed
- ✅ **Works fine**: Many developers do this
- ✅ **Can transfer later**: If needed
- ⚠️ **Personal liability**: Account is in your name

#### Option 2: Transfer to Company Account (More Professional)
- ✅ **Company ownership**: App belongs to company
- ✅ **Better for business**: Professional setup
- ⚠️ **More complex**: Requires transfer process
- ⚠️ **Timing matters**: Easier to do before first App Store release

---

## 📋 Transfer Process (If You Choose)

### When to Transfer:

**Best time:** Before first App Store release
- Easier process
- Less disruption
- Cleaner setup

**Can transfer later:** After release
- More complex
- May require re-submission
- Some limitations

### How to Transfer:

1. **Create Company Apple Developer Account**
   - Company must have legal entity (LLC, Corp, etc.)
   - Register at [developer.apple.com](https://developer.apple.com)
   - Pay $99/year

2. **Transfer App in App Store Connect**
   - Go to App Store Connect
   - Select your app
   - Go to **App Information**
   - Click **"Transfer App"**
   - Follow the process

3. **Requirements:**
   - App must be in "Ready for Sale" or "Developer Removed from Sale" status
   - No pending agreements
   - No in-app purchases with pending contracts
   - App must have been live for at least 90 days (if already published)

### What Transfers:
- ✅ App and all versions
- ✅ TestFlight testers
- ✅ App Store metadata
- ✅ In-app purchases
- ✅ App Store reviews/ratings

### What Doesn't Transfer:
- ❌ Your personal account (you keep it)
- ❌ Other apps (if you have them)
- ❌ Payment information (company sets up new)

---

## 💡 Recommendations

### For Now (Development Phase):

**Use your personal account:**
- ✅ Already paid for
- ✅ Works perfectly for TestFlight
- ✅ No issues with development/testing
- ✅ Can transfer later if needed

**Set up TestFlight:**
- ✅ Better than development builds (no expiration)
- ✅ Professional experience for testers
- ✅ Easy to manage testers
- ✅ Automatic updates

### For Later (When Ready to Launch):

**Before first App Store release:**
- Consider transferring to company account
- Cleaner business setup
- Company owns the app
- Better for legal/business purposes

**OR keep personal account:**
- Many developers do this
- Simpler
- Can transfer later if needed

---

## 🎯 Best Practice Workflow

### Phase 1: Development (Now)
1. ✅ Use personal Apple Developer account
2. ✅ Build development builds for quick testing
3. ✅ Use TestFlight for beta testing
4. ✅ Test everything thoroughly

### Phase 2: Pre-Launch
1. ✅ Continue using personal account
2. ✅ Final testing on TestFlight
3. ✅ Prepare for App Store submission

### Phase 3: Launch Decision
1. **Option A:** Submit to App Store with personal account
   - Launch now
   - Transfer to company later if needed

2. **Option B:** Transfer to company account first
   - Transfer app to company account
   - Then submit to App Store
   - Company owns from the start

### Phase 4: Post-Launch (If Needed)
- Transfer to company account
- More complex but possible
- May require some re-submission

---

## 📝 Quick Setup Checklist

### For TestFlight (Using Personal Account):

- [ ] App created in App Store Connect
- [ ] Bundle ID registered (`com.sikiya.app`)
- [ ] Production build created: `npx eas-cli build --profile production --platform ios`
- [ ] Build submitted: `npx eas-cli submit --platform ios`
- [ ] Testers added in TestFlight
- [ ] Testers invited and installed

### For Company Transfer (Later):

- [ ] Company Apple Developer account created
- [ ] Company legal entity verified
- [ ] App ready for transfer (meets requirements)
- [ ] Transfer initiated in App Store Connect
- [ ] Transfer completed
- [ ] Company account set up for payments

---

## ✅ Summary

### Can You Use TestFlight?
**YES!** You already have a paid account, so you can use TestFlight right away.

### Personal vs Company Account:
- **Now:** Use personal account - works perfectly
- **Later:** Can transfer to company account if needed
- **Best time to transfer:** Before first App Store release

### What to Do Now:
1. ✅ Set up TestFlight with your personal account
2. ✅ Start beta testing
3. ✅ Decide on company transfer before first App Store release

---

## 🚀 Next Steps

1. **Create app in App Store Connect** (if not already done)
2. **Build production version:**
   ```bash
   npx eas-cli build --profile production --platform ios
   ```
3. **Submit to TestFlight:**
   ```bash
   npx eas-cli submit --platform ios
   ```
4. **Add testers** in App Store Connect
5. **Start testing!**

---

**Bottom line:** Yes, use TestFlight with your personal account now. It works great! You can transfer to a company account later if needed, but it's easier to do before your first App Store release. For now, just set up TestFlight and start testing! 🎉

