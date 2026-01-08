# Sharing Development Builds - Complete Guide 📤

Yes, you CAN share your development build link with others, but there are some important things to know!

---

## 🎯 Quick Answer

**Yes, you can share the link!** But:
- ✅ **Android**: Easy to share - just send the link
- ⚠️ **iOS**: Can share, but testers need to trust the developer certificate
- 💡 **Better option**: Use TestFlight for iOS (easier for testers)

---

## 📱 Android: Super Easy to Share

### How it works:
1. Build your development build: `eas build --profile development --platform android`
2. EAS gives you a download link
3. **Share that link with anyone!**
4. They download the `.apk` file
5. They install it (may need to enable "Install from unknown sources")
6. Done!

### ✅ Pros:
- **Super easy** - just share the link
- **No restrictions** - anyone can install
- **No accounts needed** - testers don't need anything special
- **Works immediately**

### ⚠️ Cons:
- Testers need to enable "Install from unknown sources" (one-time setting)
- Some people might be hesitant to install from unknown sources (security concern)

### How testers install:
1. Open the link on their Android phone
2. Download the `.apk` file
3. Go to Settings → Security → Enable "Install from unknown sources"
4. Tap the downloaded `.apk` file
5. Tap "Install"
6. Done!

**Think of it like:** Sharing a file via Google Drive. Anyone with the link can download it.

---

## 🍎 iOS: Can Share, But More Complicated

### How it works:
1. Build your development build: `eas build --profile development --platform ios`
2. EAS gives you a download link
3. **Share that link**
4. Testers download the `.ipa` file
5. **They need to trust your developer certificate** (this is the tricky part)
6. Then they can install

### ✅ Pros:
- Can share with anyone
- No App Store needed
- Works for testing

### ❌ Cons:
- **Testers must trust your developer certificate** (confusing for non-technical people)
- **Certificate expires** (usually after 7 days, then they can't use the app)
- **Limited to 100 devices** per year (Apple's limit for free developer accounts)
- **More steps** for testers

### How testers install (iOS):
1. Open the link on their iPhone
2. Download the `.ipa` file
3. **Go to Settings → General → VPN & Device Management**
4. **Find your developer name** (might be confusing)
5. **Tap "Trust [Developer Name]"**
6. **Tap "Trust" again** (scary warning)
7. Then they can open the app

**The problem:** Many people find step 3-6 confusing or scary. They see warnings about "untrusted developer" and might not proceed.

**Think of it like:** Sharing a file, but the recipient needs to "unlock" it first, which involves scary warnings.

---

## 🆚 Comparison: Sharing Development Build vs TestFlight

| Feature | Development Build (iOS) | TestFlight (iOS) |
|---------|------------------------|------------------|
| **Easy to share?** | ⚠️ Medium (need to trust certificate) | ✅ Very easy (just email invite) |
| **Tester experience** | ❌ Confusing (trust certificate) | ✅ Simple (just install from TestFlight) |
| **Device limit** | 100 devices/year | 10,000 testers |
| **Certificate expires?** | ✅ Yes (7 days usually) | ❌ No |
| **Requires Apple account?** | ❌ No | ✅ Yes (free Apple ID) |
| **Requires $99/year?** | ❌ No | ✅ Yes |
| **Best for** | Internal team | Beta testers |

---

## 💡 My Recommendation

### For Android:
✅ **Share the development build link directly!**
- It's easy
- Works great
- No complications

### For iOS:
**It depends on who you're sharing with:**

#### Share Development Build if:
- ✅ Sharing with **technical people** (developers, tech-savvy friends)
- ✅ **Small team** (under 10 people)
- ✅ **Internal testing** (your team)
- ✅ You **don't have** Apple Developer account ($99/year)

#### Use TestFlight if:
- ✅ Sharing with **non-technical people** (regular users, friends, family)
- ✅ **Many testers** (more than 10)
- ✅ **Beta testing** (getting feedback from users)
- ✅ You **have** Apple Developer account
- ✅ You want **professional experience**

---

## 🚀 How to Share Development Builds

### Method 1: Direct Link Sharing

#### For Android:
```bash
# Build the app
eas build --profile development --platform android

# EAS gives you a link like:
# https://expo.dev/artifacts/eas/xxxxx.apk

# Share that link via:
# - Email
# - Slack/Discord
# - Text message
# - Any way you want!
```

#### For iOS:
```bash
# Build the app
eas build --profile development --platform ios

# EAS gives you a link like:
# https://expo.dev/artifacts/eas/xxxxx.ipa

# Share that link
# Include instructions for trusting the certificate
```

### Method 2: EAS Build Dashboard

1. Go to [expo.dev](https://expo.dev)
2. Navigate to your project
3. Go to "Builds" section
4. Find your development build
5. Click "Share" or copy the download link
6. Share with testers

---

## 📝 Instructions to Give Testers

### For Android Testers:

**Send them this:**

```
Hey! Here's a test version of my app:

1. Open this link on your Android phone: [LINK]
2. Download the file
3. Go to Settings → Security → Enable "Install from unknown sources"
4. Tap the downloaded file
5. Tap "Install"
6. Open the app!

Let me know if you have any issues!
```

### For iOS Testers:

**Send them this:**

```
Hey! Here's a test version of my app:

1. Open this link on your iPhone: [LINK]
2. Download the file
3. Go to Settings → General → VPN & Device Management
4. Find "[Your Developer Name]" in the list
5. Tap it
6. Tap "Trust [Your Developer Name]"
7. Tap "Trust" again (yes, it's safe!)
8. Now you can open the app!

Note: The app will stop working after 7 days (certificate expires). 
I'll send you a new link if you need to keep testing.

Let me know if you have any issues!
```

---

## ⚠️ Important Limitations

### iOS Development Builds:

1. **100 Device Limit**
   - Apple allows 100 devices per year for free developer accounts
   - Each tester's device counts as 1
   - If you exceed, you need to pay $99/year for Apple Developer account

2. **Certificate Expiration**
   - Development certificates usually expire after 7 days
   - After expiration, the app stops working
   - You need to rebuild and share a new link

3. **Trust Certificate Step**
   - Can be confusing for non-technical users
   - Some people might be hesitant due to security warnings

### Android Development Builds:

1. **"Unknown Sources" Warning**
   - Users need to enable installation from unknown sources
   - Some people might be hesitant
   - One-time setting per device

2. **No Automatic Updates**
   - Users need to manually download new versions
   - No push notifications for updates

---

## 🎯 Best Practices

### For Small Team (1-10 people):
- ✅ **Android**: Share development build link directly
- ✅ **iOS**: Share development build link (if team is technical) OR use TestFlight (if team is non-technical)

### For Beta Testing (10-100 people):
- ✅ **Android**: Share development build link (works great!)
- ✅ **iOS**: **Use TestFlight** (much easier for testers)

### For Large Beta Testing (100+ people):
- ✅ **Android**: Share development build link OR use Google Play Internal Testing
- ✅ **iOS**: **Must use TestFlight** (development builds have 100 device limit)

---

## 🔄 Alternative: Internal Distribution (EAS)

EAS also offers "internal distribution" which is easier than direct sharing:

```json
// In eas.json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"  // This enables easier sharing
    }
  }
}
```

This creates a shareable link that's easier for testers to use, but still has the same iOS limitations.

---

## 💰 Cost Comparison

### Development Build Sharing:
- **Free** - No cost to share
- **Android**: Unlimited sharing
- **iOS**: 100 devices/year (free tier)

### TestFlight:
- **$99/year** - Apple Developer account required
- **iOS**: Up to 10,000 testers
- **Much better experience** for testers

---

## 🎓 Real-World Example

Let's say you're building a social media app:

### Week 1: Internal Team Testing
- **Share development build link** with your 5-person team
- Everyone installs and tests
- Quick iteration

### Week 2: Friends & Family Beta
- **Android**: Share development build link (easy!)
- **iOS**: Use TestFlight (easier for non-technical friends)
- Get feedback from 20 people

### Week 3: Public Beta
- **Android**: Share development build OR use Google Play Internal Testing
- **iOS**: Use TestFlight (required for 100+ testers)
- Get feedback from 500 people

---

## ✅ Summary

### Can you share development build links?
**Yes!** But:

- **Android**: ✅ Super easy - just share the link!
- **iOS**: ⚠️ Can share, but testers need to trust certificate (confusing)

### Should you share development builds?
- **Android**: ✅ Yes, for any testing
- **iOS**: 
  - ✅ Yes, for technical people/small teams
  - ❌ Use TestFlight for non-technical people/large groups

### Best Practice:
- **Small team (< 10)**: Share development build links
- **Beta testing (> 10)**: Use TestFlight for iOS, share link for Android
- **Large beta (> 100)**: Use TestFlight for iOS (required), Google Play Internal Testing for Android

---

## 🎉 Quick Decision Guide

**"Should I share my development build or use TestFlight?"**

Ask yourself:
1. **How many testers?**
   - < 10 → Development build is fine
   - > 10 → Consider TestFlight

2. **Are they technical?**
   - Technical → Development build works
   - Non-technical → Use TestFlight

3. **Do you have $99/year?**
   - No → Use development build
   - Yes → TestFlight is better

4. **What platform?**
   - Android → Development build is great!
   - iOS → TestFlight is usually better

---

**Bottom line:** You CAN share development build links, and it works great for Android and small iOS teams. For larger iOS testing, TestFlight is worth the $99/year for the better experience!

