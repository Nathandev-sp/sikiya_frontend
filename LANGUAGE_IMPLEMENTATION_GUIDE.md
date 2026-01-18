# Sikiya Language Implementation Guide

## Overview

Sikiya now supports bilingual functionality with English and French. Users can:
1. **Choose App Language**: English or French UI
2. **Choose Content Language**: English only, French only, or Both
3. Content is automatically filtered based on user preferences

---

## What Has Been Implemented

### ✅ Backend (Complete)

#### 1. Database Models Updated
- **User_profile**: Added `appLanguage` (en/fr) and `contentLanguage` (english/french/both)
- **Journalist_profile**: Added `appLanguage` (en/fr)
- **Publisher_profile**: Added `appLanguage` (en/fr)
- **Articles**: Added `language` field (english/french)
- **Videos**: Added `language` field (english/french)

#### 2. Migration Script
- **File**: `/sikiya_backend/migrate-language-defaults.js`
- **Purpose**: Sets all existing content and users to English
- **Run Once**: `node migrate-language-defaults.js`

#### 3. API Routes Enhanced
- **Article Routes** (`/articleRoutes.js`):
  - Content creation automatically tagged with journalist's app language
  - Article feeds filtered by user's content language preference
  - Headlines, search, and explore all respect language preferences

- **Video Routes** (`/videoRoutes.js`):
  - Video creation automatically tagged with journalist's app language
  - Video feeds filtered by user's content language preference

- **User Routes** (`/userRoutes.js`):
  - New endpoints:
    - `GET /user/language-preferences` - Get current preferences
    - `PUT /user/language-preferences` - Update preferences
  - Signup updated to accept language preferences
  - Journalist discovery can be filtered by language (ready for future)

#### 4. Language Filtering Logic
```javascript
// User with contentLanguage: 'english' → sees only English articles/videos
// User with contentLanguage: 'french' → sees only French articles/videos
// User with contentLanguage: 'both' → sees all articles/videos
```

---

### ✅ Frontend (Core Complete)

#### 1. i18n Setup
- **Library**: `i18n-js` + `expo-localization`
- **Config**: `/src/utils/i18n.js`
- **Translations**:
  - `/src/translations/en.json` - English translations
  - `/src/translations/fr.json` - French translations (needs refinement)

#### 2. Language Context
- **File**: `/src/Context/LanguageContext.js`
- **Features**:
  - Global language state management
  - Automatic device language detection for new users
  - AsyncStorage persistence
  - Backend sync
  - Translation helper function: `t(key)`

**Usage Example**:
```javascript
import { useLanguage } from '../../Context/LanguageContext';

const MyComponent = () => {
  const { t, appLanguage, contentLanguage, changeLanguagePreferences } = useLanguage();
  
  return <Text>{t('common.loading')}</Text>;
};
```

#### 3. Language Settings Screen
- **File**: `/src/Screens/UserProfileScreens/LanguageSettingScreen.js`
- **Features**:
  - App language selector (en/fr)
  - Content language selector (english/french/both)
  - Real-time preview
  - Saves to backend and AsyncStorage
  - Fully functional and styled

#### 4. App.js Integration
- **LanguageProvider** wrapped around the app
- Language loads before app renders
- Persists across sessions

---

## What Needs To Be Done

### 🔄 Frontend Translation (In Progress)

You need to systematically update each screen and component to use the translation function `t()` instead of hardcoded strings.

#### Priority Order:

1. **High Priority Screens** (User-facing):
   - [ ] HomeScreen.js
   - [ ] LiveNews.js
   - [ ] SearchScreen.js
   - [ ] UserProfileScreen.js
   - [ ] SettingsScreen.js
   - [ ] NewsHome.js
   - [ ] NewsCategoryScreen.js
   - [ ] NotificationCenterScreen.js

2. **Auth Screens**:
   - [ ] LoginScreen.js
   - [ ] SignupScreen.js
   - [ ] OnboardingScreen.js
   - [ ] EmailConfirmationScreen.js
   - [ ] ForgotPasswordScreen.js
   - [ ] All Join screens (General, Journalist, Premium)

3. **Settings Screens**:
   - [ ] ProfileSettingScreen.js
   - [ ] MembershipSettingScreen.js
   - [ ] GeneralSettingScreen.js
   - [ ] NotificationPreferencesScreen.js
   - [ ] PaymentMethodSettingScreen.js
   - [ ] CommentHistorySettingScreen.js
   - [ ] HelpSupportSettingScreen.js

4. **Components** (45 files):
   - All components in `/src/Components/`
   - Navigation components (4 files)
   - Feedback components (7 files)

#### Translation Pattern:

**Before**:
```javascript
<Text>Loading...</Text>
<Button title="Save" />
```

**After**:
```javascript
import { useLanguage } from '../../Context/LanguageContext';

const MyScreen = () => {
  const { t } = useLanguage();
  
  return (
    <>
      <Text>{t('common.loading')}</Text>
      <Button title={t('common.save')} />
    </>
  );
};
```

---

## How To Use

### For Developers

1. **Import the hook**:
```javascript
import { useLanguage } from '../Context/LanguageContext';
```

2. **Use in component**:
```javascript
const { t, appLanguage, contentLanguage } = useLanguage();
```

3. **Translate text**:
```javascript
// Simple translation
<Text>{t('common.loading')}</Text>

// With variables
<Text>{t('time.minutesAgo', { count: 5 })}</Text>

// Nested keys
<Text>{t('settings.accountSettings')}</Text>
```

4. **Add new translations**:
   - Add to `/src/translations/en.json`
   - Add French version to `/src/translations/fr.json`

### For Content Creators (Journalists/Publishers)

When creating articles or videos:
- Content is **automatically tagged** with your app language
- If you're using the French app, your content will be tagged as French
- If you're using the English app, your content will be tagged as English

### For Users

1. **Change Language**:
   - Go to Settings → Language Settings
   - Select app language (changes UI)
   - Select content language preference (filters content)
   - Click Save

2. **First Time Users**:
   - App detects your device language
   - If device is in French → App + Content = French
   - Otherwise → App + Content = English
   - You can change anytime

---

## API Integration

### Signup with Language Preferences

**User Signup**:
```javascript
await SikiyaAPI.post('/signup/user', {
  firstname,
  lastname,
  // ... other fields
  appLanguage: 'en', // or 'fr'
  contentLanguage: 'english' // or 'french' or 'both'
});
```

**Journalist Signup**:
```javascript
await SikiyaAPI.post('/signup/journalist', {
  firstname,
  lastname,
  // ... other fields
  appLanguage: 'en' // or 'fr'
});
```

### Update Language Preferences

```javascript
await SikiyaAPI.put('/user/language-preferences', {
  appLanguage: 'fr',
  contentLanguage: 'both'
}, {
  headers: { Authorization: `Bearer ${token}` }
});
```

### Get Language Preferences

```javascript
const response = await SikiyaAPI.get('/user/language-preferences', {
  headers: { Authorization: `Bearer ${token}` }
});
// Returns: { appLanguage: 'en', contentLanguage: 'english' }
```

---

## Running the Migration

**⚠️ IMPORTANT**: Run this once after deploying the updated models:

```bash
cd sikiya_backend
node migrate-language-defaults.js
```

This will:
- Set all existing users to English (app + content)
- Set all existing articles to English
- Set all existing videos to English
- Set all existing journalists/publishers to English

---

## Translation File Structure

```json
{
  "common": {
    "loading": "Loading...",
    "error": "Error",
    "save": "Save"
  },
  "auth": {
    "signIn": "Sign In",
    "signUp": "Sign Up"
  },
  "profile": {
    "editProfile": "Edit Profile",
    "followers": "Followers"
  }
  // ... more sections
}
```

### Organized by Category:
- `common` - Buttons, actions, states
- `auth` - Authentication screens
- `profile` - Profile related
- `article` - Article related
- `video` - Video related
- `navigation` - Navigation items
- `settings` - Settings screens
- `language` - Language settings
- `errors` - Error messages
- `time` - Time/date strings

---

## Testing Checklist

### Backend
- [ ] Run migration script successfully
- [ ] Test article creation with French app language
- [ ] Test video creation with English app language
- [ ] Test content filtering (english/french/both)
- [ ] Test language preferences update API

### Frontend
- [ ] Install new dependencies: `npm install i18n-js expo-localization`
- [ ] Test language switching in settings
- [ ] Test device language detection on fresh install
- [ ] Verify translations display correctly
- [ ] Test AsyncStorage persistence

---

## Next Steps

1. **Refine French Translations**:
   - Review `/src/translations/fr.json`
   - Update with proper French phrasing
   - Add missing translations

2. **Translate Screens Systematically**:
   - Start with high-priority screens
   - Use the pattern shown above
   - Test each screen as you translate

3. **Add More Translation Keys**:
   - As you translate screens, you'll find text not in translation files
   - Add them to both `en.json` and `fr.json`

4. **Update Signup Flows**:
   - Ensure new users can set language preferences
   - Update onboarding to include language selection (optional)

---

## Troubleshooting

### "Translation key not found"
- Add the key to both `en.json` and `fr.json`
- Restart the app

### "Language not changing"
- Check AsyncStorage is working
- Verify LanguageProvider is wrapping the app
- Check i18n.locale is being set

### "Content not filtering"
- Verify migration script ran successfully
- Check user's contentLanguage in database
- Verify API routes have language filter logic

---

## Contact

For issues or questions:
- Check the implementation files
- Review this guide
- Test in both English and French modes

**Date**: January 2026
**Version**: 1.0

