# Fix: Missing babel-preset-expo

## 🎯 The Problem

**Error:** `Cannot find module 'babel-preset-expo'`

Your `babel.config.js` references `babel-preset-expo`, but it's not installed in your `package.json`.

---

## 🚀 Quick Fix

Install the missing package:

```bash
cd /Users/nathancibonga/Desktop/sikiya_frontend
npx expo install babel-preset-expo
```

**OR** if that doesn't work:

```bash
npm install --save-dev babel-preset-expo
```

---

## ✅ After Installing

1. **Restart the dev server:**
   - Stop the current server (Ctrl+C)
   - Run: `npx expo start --dev-client` again

2. **The error should be gone!**

---

## 🔍 Why This Happened

When you removed `node_modules` earlier (to fix duplicate dependencies), some packages might not have been reinstalled properly. `babel-preset-expo` is a dev dependency that's required for Expo projects.

---

## 📝 What babel-preset-expo Does

- Transforms your JavaScript/React code
- Enables Expo-specific features
- Required for Metro bundler to work
- Part of the Expo build system

---

**Run the install command above and restart your dev server!** 🚀

