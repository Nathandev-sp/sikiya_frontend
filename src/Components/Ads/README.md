# AdMob Ad Components

This directory contains AdMob (Google AdMob) components for displaying ads in the Sikiya app.

---

## Components

### 1. `BannerAd.js`
Banner ad component that displays rectangular ads at the top or bottom of screens.

**Usage:**
```javascript
import BannerAd from '../Components/Ads/BannerAd';

<BannerAd position="bottom" />
```

**Props:**
- `position` (string, optional): 'top' or 'bottom' (default: 'bottom')
- `style` (object, optional): Custom styles
- `adUnitId` (string, optional): Override default ad unit ID

---

### 2. `InterstitialAd.js` (Hook)
Hook for displaying full-screen interstitial ads between screens.

**Usage:**
```javascript
import { useInterstitialAd } from '../Components/Ads/InterstitialAd';

const MyScreen = () => {
  const { showAd, isLoaded } = useInterstitialAd();

  const handleNavigate = async () => {
    if (isLoaded) {
      await showAd(); // Show ad before navigation
    }
    // Navigate to next screen
  };

  return (
    <TouchableOpacity onPress={handleNavigate}>
      <Text>Next Article</Text>
    </TouchableOpacity>
  );
};
```

---

### 3. `RewardedAd.js` (Hook)
Hook for displaying rewarded ads (users watch to earn rewards).

**Usage:**
```javascript
import { useRewardedAd } from '../Components/Ads/RewardedAd';

const VideoScreen = () => {
  const { showRewardedAd, isLoaded } = useRewardedAd();

  const handleUnlockVideos = async () => {
    const earned = await showRewardedAd();
    if (earned) {
      // User watched ad, unlock more videos
      // Track ad view in backend
      unlockVideos();
    }
  };

  return (
    <TouchableOpacity onPress={handleUnlockVideos}>
      <Text>Watch Ad to Unlock More Videos</Text>
    </TouchableOpacity>
  );
};
```

---

### 4. `ConditionalAdWrapper.js`
Wrapper component that only shows ads for 'general' users. Hides ads for 'contributor' users.

**Usage:**
```javascript
import ConditionalAdWrapper from '../Components/Ads/ConditionalAdWrapper';

const MyScreen = () => {
  return (
    <View>
      {/* Your content */}
      
      {/* Ads only show for general users */}
      <ConditionalAdWrapper position="bottom" />
    </View>
  );
};
```

---

## User Role Logic

- **`role: 'general'`**: Shows ads (free tier)
- **`role: 'contributor'`**: No ads (paid tier, ad-free)
- **`role: 'journalist'`**: No ads
- **`role: 'admin'`**: No ads

Ads are automatically hidden for non-general users via `ConditionalAdWrapper`.

---

## Setup

1. Install package: `npx expo install react-native-google-mobile-ads`
2. Configure `app.json` with AdMob App IDs
3. Add ad unit IDs to `.env` file
4. Use components in your screens

See `ADMOB_SETUP_GUIDE.md` in the root directory for detailed setup instructions.

---

## Testing

During development, components automatically use test ad unit IDs.

For production, use real ad unit IDs from your AdMob account.

---

## Important Notes

- Ads only work in production builds, not Expo Go
- Always check user role before showing ads
- Contributors should never see ads
- Use test ad unit IDs during development


