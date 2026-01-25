# Sikiya Terms & Conditions

This folder contains the Terms and Conditions for Sikiya in multiple languages and for different user types.

## File Structure

- **TermsAndConditions.js** - Main file containing all T&Cs
- **UserT&C.js** - Legacy file (maintained for backward compatibility)

## Structure

The `TermsAndConditions.js` exports an object with the following structure:

```javascript
termsAndConditions = {
  user: {
    en: { /* English user T&C */ },
    fr: { /* French user T&C */ }
  },
  journalist: {
    en: { /* English journalist T&C */ },
    fr: { /* French journalist T&C */ }
  }
}
```

## Usage

### In TermAndConditionsScreen Component

```javascript
import { termsAndConditions } from "../../../assets/PDFs/TermsAndConditions";

// Get the appropriate terms based on user type and language
const language = appLanguage === 'fr' ? 'fr' : 'en';
const userType = 'user'; // or 'journalist'
const termsData = termsAndConditions[userType][language];

// Use termsData.title, termsData.lastUpdated, termsData.sections
```

### User Types

- **user** - General users who consume content
- **journalist** - Content creators who publish articles

### Languages

- **en** - English
- **fr** - French (Français)

## Updating Terms & Conditions

To update the Terms & Conditions:

1. Open `TermsAndConditions.js`
2. Navigate to the appropriate section:
   - `termsAndConditions.user.en` for English user terms
   - `termsAndConditions.user.fr` for French user terms
   - `termsAndConditions.journalist.en` for English journalist terms
   - `termsAndConditions.journalist.fr` for French journalist terms
3. Update the `lastUpdated` date
4. Modify the sections as needed

## Passing User Type to TermAndConditionsScreen

When navigating to the TermAndConditionsScreen, pass the `userType` parameter:

```javascript
// For general users
navigation.navigate('TermAndConditionsScreen', {
  userInfo: userInfo,
  userType: 'user'
});

// For journalists
navigation.navigate('TermAndConditionsScreen', {
  userInfo: userInfo,
  userType: 'journalist'
});
```

## Section Format

Each section in the terms should follow this format:

```javascript
{
  heading: "Section Title",
  content: "Section content goes here..."
}
```

## Last Updated

- User Terms: January 22, 2026
- Journalist Terms: January 22, 2026
