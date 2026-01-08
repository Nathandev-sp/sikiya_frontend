# Fixing Duplicate Dependencies

You have a duplicate dependency issue with `react-native-safe-area-context`. Here's how to fix it.

---

## 🔍 The Problem

You have two versions of `react-native-safe-area-context`:
- Version `5.6.1` (main dependency - correct)
- Version `4.5.0` (nested in `react-native-calendars` - old version)

This can cause build errors because native modules can only have one version.

---

## 🚀 Solution

### Option 1: Force Resolution (Recommended)

Add a `resolutions` field to your `package.json` to force all packages to use the same version:

```json
{
  "name": "sikiya",
  "version": "1.0.0",
  "resolutions": {
    "react-native-safe-area-context": "5.6.1"
  },
  ...
}
```

Then reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Option 2: Update react-native-calendars

The issue is that `react-native-calendars` has an old version as a dependency. Try updating it:

```bash
npm install react-native-calendars@latest
npm dedupe
```

### Option 3: Manual Fix

```bash
# Remove node_modules and lock file
rm -rf node_modules package-lock.json

# Reinstall everything
npm install

# Force deduplication
npm dedupe

# If still not fixed, try:
npm install react-native-safe-area-context@5.6.1 --force
npm dedupe
```

---

## ✅ Quick Fix (Try This First)

Run these commands:

```bash
cd /Users/nathancibonga/Desktop/sikiya_frontend

# Remove node_modules
rm -rf node_modules package-lock.json

# Reinstall
npm install

# Force deduplication
npm dedupe

# Verify
npx expo-doctor
```

---

## 📝 If That Doesn't Work

Add resolutions to `package.json`:

1. Open `package.json`
2. Add this after the `"private": true` line:

```json
{
  "name": "sikiya",
  "version": "1.0.0",
  ...
  "private": true,
  "resolutions": {
    "react-native-safe-area-context": "5.6.1"
  }
}
```

3. Then run:
```bash
rm -rf node_modules package-lock.json
npm install
npm dedupe
npx expo-doctor
```

---

## ⚠️ About the Other Warnings

The package validation warnings are **non-critical** and can be ignored:
- `react-native-geolocation-service` - Untested/Unmaintained (just a warning)
- `react-native-spinkit` - Untested (just a warning)
- Missing metadata - Just informational

These won't break your build. You can suppress them by adding to `package.json`:

```json
{
  "expo": {
    "doctor": {
      "reactNativeDirectoryCheck": {
        "exclude": [
          "react-native-geolocation-service",
          "react-native-spinkit"
        ],
        "listUnknownPackages": false
      }
    }
  }
}
```

---

## 🎯 Summary

**Critical Issue:**
- ✅ Fix duplicate `react-native-safe-area-context` dependency

**Non-Critical (Can Ignore):**
- Package validation warnings (just informational)

Run the quick fix commands above and you should be good! 🚀

