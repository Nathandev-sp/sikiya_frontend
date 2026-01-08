# Development Build Expiration - How Long Do They Last?

## 🎯 Quick Answer

**iOS Development Builds:**
- ✅ **Certificate expires after ~7 days** (usually 7 days, sometimes up to 1 year)
- ❌ **App stops working** after certificate expires
- ✅ **Solution**: Rebuild and share new link

**Android Development Builds:**
- ✅ **Don't expire** - They work forever!
- ✅ **No certificate expiration** - Can use indefinitely

---

## 📱 iOS Development Build Expiration

### How It Works:

1. **When you build**: EAS creates a development certificate
2. **Certificate is valid**: Usually for 7 days (sometimes up to 1 year)
3. **After expiration**: The app stops working on devices
4. **Users see**: "Untrusted Developer" or app won't open

### Timeline:

```
Day 1: Build created ✅
Day 2-7: App works perfectly ✅
Day 8: Certificate expires ❌
Day 8+: App stops working ❌
```

### What Happens When It Expires:

- **App won't open** on devices
- **Users see error**: "Untrusted Developer" or similar
- **Need new build**: You must rebuild and share new link

---

## 🤖 Android Development Build Expiration

### How It Works:

- **No expiration!** Android development builds work forever
- **No certificate expiration** - Can use indefinitely
- **Users can keep using** the same build forever

### Timeline:

```
Day 1: Build created ✅
Day 2+: App works forever ✅
No expiration! ✅
```

---

## 🔄 What To Do When iOS Build Expires

### Option 1: Rebuild (Recommended)

1. **Build new version:**
   ```bash
   npx eas-cli build --profile development --platform ios
   ```

2. **Get new download link** (from EAS)

3. **Share new link** with testers

4. **Testers install new build** (replaces old one)

**Time:** 10-20 minutes to rebuild

### Option 2: Use TestFlight (For Production Testing)

If you want builds that don't expire:
- Build production version
- Submit to TestFlight
- TestFlight builds don't expire (but require $99/year Apple Developer account)

---

## ⏰ Certificate Duration

### Development Certificates:

- **Typical duration**: 7 days
- **Maximum duration**: Up to 1 year (if you have paid Apple Developer account)
- **Free accounts**: Usually 7 days

### Why 7 Days?

- Apple limits free developer accounts to short-lived certificates
- This prevents abuse and limits distribution
- Paid accounts ($99/year) can get longer certificates

---

## 💡 Best Practices

### For iOS Development Builds:

1. **Tell testers upfront**: "This build expires in 7 days"
2. **Plan ahead**: Rebuild before expiration if needed
3. **Use for short-term testing**: Development builds are for active development
4. **For long-term testing**: Use TestFlight (production builds)

### For Android Development Builds:

1. **No expiration concerns**: Share freely
2. **Can reuse same build**: No need to rebuild unless you add new features
3. **Perfect for long-term testing**: Works indefinitely

---

## 📊 Comparison

| Platform | Expires? | Duration | Solution |
|----------|----------|----------|----------|
| **iOS Development** | ✅ Yes | ~7 days | Rebuild |
| **iOS Production (TestFlight)** | ❌ No | Forever | $99/year account |
| **Android Development** | ❌ No | Forever | None needed |

---

## 🎯 Real-World Scenarios

### Scenario 1: Testing for 1 Week

**iOS:**
- Build on Day 1
- Share with testers
- Works until Day 7
- Rebuild on Day 8 if needed

**Android:**
- Build on Day 1
- Share with testers
- Works forever
- No rebuild needed

### Scenario 2: Testing for 1 Month

**iOS:**
- Build on Day 1
- Works until Day 7
- **Rebuild on Day 8** (new link)
- Works until Day 15
- **Rebuild on Day 16** (new link)
- Continue as needed

**OR use TestFlight** (no expiration, but requires $99/year)

**Android:**
- Build on Day 1
- Works for entire month
- No rebuild needed

### Scenario 3: Long-Term Beta Testing

**iOS:**
- **Use TestFlight** (production builds don't expire)
- Requires $99/year Apple Developer account
- Better for long-term testing

**Android:**
- Development build works fine
- No expiration, can use forever

---

## 🔔 Notifying Testers

### When Sharing iOS Development Build:

**Tell them:**
```
Hey! Here's a test version of my app:

⚠️ Important: This build expires in 7 days
- Download and install now
- Test it out
- If you need to keep testing after 7 days, I'll send you a new link

[Download Link]
```

### When Sharing Android Development Build:

**Tell them:**
```
Hey! Here's a test version of my app:

✅ This build doesn't expire - you can use it as long as you want!

[Download Link]
```

---

## 🚀 Solutions for Long-Term iOS Testing

### Option 1: Rebuild Weekly (Free)

- Build new version every 7 days
- Share new link with testers
- **Cost**: Free (30 builds/month on free tier)
- **Effort**: 10-20 minutes per week

### Option 2: Use TestFlight (Paid)

- Build production version
- Submit to TestFlight
- Testers get updates automatically
- **Cost**: $99/year Apple Developer account
- **Effort**: One-time setup, then automatic

### Option 3: Paid Apple Developer Account (Longer Certificates)

- With paid account ($99/year), certificates can last up to 1 year
- Still need to rebuild, but less frequently
- **Cost**: $99/year
- **Benefit**: Longer certificate duration

---

## ✅ Summary

### iOS Development Builds:
- ⏰ **Expire in ~7 days** (certificate expiration)
- 🔄 **Solution**: Rebuild and share new link
- 💡 **For long-term**: Use TestFlight (production builds)

### Android Development Builds:
- ✅ **Don't expire** - Work forever
- ✅ **No rebuild needed** unless adding new features
- ✅ **Perfect for long-term testing**

### What To Tell Testers:

**iOS:**
- "This build expires in 7 days. I'll send a new link if you need to keep testing."

**Android:**
- "This build doesn't expire - use it as long as you want!"

---

## 🎓 Key Takeaways

1. **iOS development builds expire** (~7 days) - This is normal and expected
2. **Android development builds don't expire** - Can use forever
3. **Rebuilding is easy** - Just run the build command again
4. **For long-term iOS testing** - Consider TestFlight (production builds)
5. **Tell testers upfront** - Let them know about expiration

---

**Bottom line:** Yes, iOS development builds expire in ~7 days. Android builds don't expire. For iOS, you'll need to rebuild and share a new link after expiration. For long-term iOS testing, TestFlight is better (but requires $99/year). 🚀

