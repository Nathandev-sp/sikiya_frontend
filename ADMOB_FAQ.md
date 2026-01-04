# AdMob FAQ - Common Questions

---

## Q: Do I need separate ad unit IDs for Android and iOS?

**A: No! You can use the same ad unit IDs for both platforms.**

### How It Works:

- **App IDs** are different for Android and iOS (you have 2 different apps in AdMob)
- **Ad Unit IDs** are platform-agnostic (the same ad unit ID works on both platforms)

### Example:

```
Android App ID: ca-app-pub-123456789~AndroidAppId
iOS App ID: ca-app-pub-123456789~iOSAppId

Banner Ad Unit ID: ca-app-pub-123456789/1111111111  ← Same for both!
Interstitial Ad Unit ID: ca-app-pub-123456789/2222222222  ← Same for both!
Rewarded Ad Unit ID: ca-app-pub-123456789/3333333333  ← Same for both!
```

### When to Use Separate Ad Unit IDs:

You **can** create separate ad units for each platform if you want:
- ✅ Better tracking/analytics per platform
- ✅ Different ad settings per platform
- ✅ Separate revenue reporting

But it's **not required** - the same ad unit IDs work perfectly fine for both platforms!

---

## Q: Which app should I create ad units in?

**A: It doesn't matter!** 

You can create ad units in either your Android app or iOS app. Once created, the same ad unit IDs work for both platforms.

**Recommended**: Create them in your Android app (or whichever one you set up first), then use those same IDs for iOS.

---

## Q: Can I use the same ad unit ID for different ad types (Banner, Interstitial, Rewarded)?

**A: No!** Each ad type needs its own unique ad unit ID.

You need:
- 1 Banner ad unit ID
- 1 Interstitial ad unit ID  
- 1 Rewarded ad unit ID

But these same 3 IDs work for both Android and iOS.

---

## Q: What's the difference between App ID and Ad Unit ID?

**App ID:**
- Identifies your app in AdMob
- Different for Android and iOS
- Example: `ca-app-pub-123456789~AndroidAppId`

**Ad Unit ID:**
- Identifies a specific ad placement in your app
- Works for both Android and iOS
- Example: `ca-app-pub-123456789/1111111111`

---

## Summary

✅ **Use the same ad unit IDs for Android and iOS**
✅ **Create ad units in either app (doesn't matter which)**
✅ **Use the same 3 ad unit IDs (Banner, Interstitial, Rewarded) for both platforms**

This is the standard and recommended approach! 🎯


