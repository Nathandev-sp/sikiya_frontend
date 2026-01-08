# Debugging: App Stuck on Loading Screen

Your app is showing the logo and not loading. This is likely because the preloading API calls are failing or hanging. Here's how to fix it.

---

## 🔍 The Problem

Looking at your `App.js`, the app makes several API calls on startup:
1. `articles/home`
2. `/journalists/random`
3. `/article/search`
4. `/user/profile/` ⚠️ **This requires authentication!**
5. `/articles/home/headlines`
6. `videos/home`

If any of these fail or hang, the app gets stuck on the loading screen.

---

## 🚀 Quick Fix: Make Preloading More Resilient

The issue is that your preloading tries to fetch data even when the user isn't logged in. Let's fix this:

### Option 1: Check Console Logs First

1. **Connect your iPhone to your Mac**
2. **Open Xcode** (if you have it)
3. **Go to Window → Devices and Simulators**
4. **Select your iPhone**
5. **Click "Open Console"**
6. **Look for error messages**

OR use React Native Debugger or check Metro bundler logs.

### Option 2: Make API Calls Optional

The problem is likely the `/user/profile/` call which requires authentication. Let's make it conditional:

```javascript
// In App.js, around line 356-368
// Only make authenticated calls if user is logged in
if (state.token) {
  try {
    const userProfileResponse = await SikiyaAPI.get('/user/profile/');
    setPreloadedUserProfile(userProfileResponse.data);
  } catch (err) {
    console.log('Failed to load user profile:', err);
    // Don't block the app - just continue
  }
} else {
  // User not logged in, skip profile loading
  setPreloadedUserProfile(null);
}
```

---

## 🛠️ Step-by-Step Fix

### Step 1: Check Your Backend

Make sure your backend is running:
- Check if `https://sikiya-backend.onrender.com` is accessible
- Test the endpoints in a browser or Postman

### Step 2: Add Error Handling

Wrap each API call in try-catch so failures don't block the app:

```javascript
// Make each API call independent
try {
  const homeArticlesResponse = await SikiyaAPI.get('articles/home');
  setPreloadedHomeArticles(homeArticlesResponse.data);
} catch (err) {
  console.log('Failed to load home articles:', err);
  // Continue anyway
}

try {
  const searchJournalistResponse = await SikiyaAPI.get('/journalists/random');
  setPreloadedSearchJournalist(searchJournalistResponse.data);
} catch (err) {
  console.log('Failed to load journalists:', err);
  // Continue anyway
}

// ... etc for each call
```

### Step 3: Add Timeout

Add timeouts so calls don't hang forever:

```javascript
// Add timeout to API calls
const timeout = 10000; // 10 seconds

try {
  const homeArticlesResponse = await Promise.race([
    SikiyaAPI.get('articles/home'),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), timeout)
    )
  ]);
  setPreloadedHomeArticles(homeArticlesResponse.data);
} catch (err) {
  console.log('API call failed or timed out:', err);
  // Continue anyway
}
```

### Step 4: Skip Preloading if Not Logged In

Only preload authenticated data if user is logged in:

```javascript
// Only preload user-specific data if logged in
if (state.token) {
  // Preload user profile, etc.
} else {
  // Skip user-specific preloading
  // Just preload public data
}
```

---

## 🔧 Quick Fix Code

Here's a more resilient version of your preload function:

```javascript
useEffect(() => {
  const preloadApp = async () => {
    try {
      // Try to sign in locally
      try {
        await tryLocalSignin();
      } catch (err) {
        console.log('Local signin check completed:', err.message || err);
      }
      
      // Initialize push notifications (only if authenticated)
      if (state.token) {
        try {
          await initializePushNotifications();
        } catch (err) {
          console.log('Push notification init failed:', err.message || err);
        }
      }
      
      // Preload public data (works without auth)
      const publicDataPromises = [
        SikiyaAPI.get('articles/home').catch(err => {
          console.log('Failed to load home articles:', err);
          return { data: null };
        }),
        SikiyaAPI.get('/journalists/random').catch(err => {
          console.log('Failed to load journalists:', err);
          return { data: null };
        }),
        SikiyaAPI.get('/article/search').catch(err => {
          console.log('Failed to load search articles:', err);
          return { data: null };
        }),
        SikiyaAPI.get('/articles/home/headlines').catch(err => {
          console.log('Failed to load headlines:', err);
          return { data: null };
        }),
        SikiyaAPI.get('videos/home?page=1&limit=5').catch(err => {
          console.log('Failed to load videos:', err);
          return { data: null };
        }),
      ];
      
      // Preload user-specific data (only if authenticated)
      if (state.token) {
        publicDataPromises.push(
          SikiyaAPI.get('/user/profile/').catch(err => {
            console.log('Failed to load user profile:', err);
            return { data: null };
          })
        );
      }
      
      // Wait for all calls (with timeout)
      const results = await Promise.allSettled(
        publicDataPromises.map(p => 
          Promise.race([
            p,
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Timeout')), 10000)
            )
          ])
        )
      );
      
      // Set data (handle failures gracefully)
      if (results[0].status === 'fulfilled') {
        setPreloadedHomeArticles(results[0].value.data);
      }
      if (results[1].status === 'fulfilled') {
        setPreloadedSearchJournalist(results[1].value.data);
      }
      if (results[2].status === 'fulfilled') {
        setPreloadedSearchArticles(results[2].value.data);
      }
      if (results[3].status === 'fulfilled') {
        setPreloadedHeadlines(results[3].value.data);
      }
      if (results[4].status === 'fulfilled') {
        setPreloadedVideos(results[4].value.data);
      }
      if (state.token && results[5]?.status === 'fulfilled') {
        setPreloadedUserProfile(results[5].value.data);
      }
      
      await sleep(40); // Simulate delay
    } catch (error) {
      console.error("Error preloading app:", error);
      // Don't block the app - continue anyway
    } finally {
      setIsAppLoading(false);
    }
  };

  preloadApp();
}, [state.token]); // Add state.token as dependency
```

---

## 🐛 Common Issues

### Issue 1: Backend Not Running
**Symptom:** All API calls fail
**Fix:** Make sure your backend is running and accessible

### Issue 2: Network Issues
**Symptom:** API calls timeout
**Fix:** Check your internet connection, add timeouts

### Issue 3: Authentication Required
**Symptom:** `/user/profile/` fails when not logged in
**Fix:** Only call authenticated endpoints if `state.token` exists

### Issue 4: Wrong API URL
**Symptom:** API calls fail with connection errors
**Fix:** Check your `.env` file or `EXPO_PUBLIC_API_URL`

### Issue 5: CORS Issues
**Symptom:** API calls fail with CORS errors
**Fix:** Configure CORS on your backend

---

## ✅ Quick Test

To test if it's the API calls:

1. **Temporarily comment out all API calls:**
```javascript
// Comment out all SikiyaAPI.get() calls
// Just set data to null
setPreloadedHomeArticles(null);
setPreloadedSearchJournalist(null);
// ... etc
setIsAppLoading(false);
```

2. **If app loads now** → It's the API calls causing the issue
3. **If app still stuck** → It's something else (check console logs)

---

## 📝 Environment Variables

Check if you need environment variables:

1. **Check for `.env` file** in your project root
2. **Check `EXPO_PUBLIC_API_URL`** - should be your backend URL
3. **Default is:** `https://sikiya-backend.onrender.com`

If your backend URL is different, create `.env`:
```
EXPO_PUBLIC_API_URL=https://your-backend-url.com
```

---

## 🎯 Most Likely Issue

**The `/user/profile/` endpoint is being called even when the user isn't logged in**, causing the app to hang or fail.

**Quick fix:** Only call authenticated endpoints if `state.token` exists.

---

## 🚀 Next Steps

1. **Check console logs** to see which API call is failing
2. **Make API calls optional** (don't block app if they fail)
3. **Add timeouts** so calls don't hang forever
4. **Only call authenticated endpoints** if user is logged in

Let me know what errors you see in the console, and I can help fix the specific issue!

