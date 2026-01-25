# Free Trial Frontend Implementation Guide

## Overview
This guide covers the frontend implementation of the 7-day free trial feature in the Sikiya app. Users receive contributor role access for 7 days upon signup, with a prominent banner displayed on their profile screen.

## Components Modified

### 1. AuthContext (`src/Context/AuthContext.js`)

#### New State Fields
```javascript
{
  token: null,
  role: null,
  errorMessage: '',
  verifiedEmail: false,
  email: null,
  isOnTrial: false,      // NEW: Whether user is on trial
  trialEndDate: null,    // NEW: When trial expires
  daysRemaining: 0       // NEW: Days left in trial
}
```

#### New Action: `update_trial`
Updates trial information in state after fetching from API.

#### New Function: `fetchTrialStatus`
```javascript
const fetchTrialStatus = (dispatch) => async () => {
  const response = await SikiyaAPI.get('/user/trial-status');
  // Updates state and AsyncStorage with latest trial info
};
```

#### Updated Functions
- `signup`: Now stores trial info from backend response
- `signin`: Fetches and stores trial info during login
- `tryLocalSignin`: Retrieves trial info on app startup
- `clearState`: Clears trial info from AsyncStorage on logout

### 2. User Profile Screen (`src/Screens/UserProfileScreen.js`)

#### New State
```javascript
const [trialInfo, setTrialInfo] = useState({
  isOnTrial: false,
  daysRemaining: 0
});
```

#### Trial Banner Component
```jsx
{trialInfo.isOnTrial && trialInfo.daysRemaining > 0 && (
  <View style={styles.trialBanner}>
    <View style={styles.trialIconContainer}>
      <Ionicons name="gift" size={32} color={MainSecondaryBlueColor} />
    </View>
    <View style={styles.trialTextContainer}>
      <Text style={styles.trialTitle}>{i18n.t('trial.title')}</Text>
      <Text style={styles.trialMessage}>{i18n.t('trial.message')}</Text>
      <Text style={styles.trialDaysRemaining}>
        {trialInfo.daysRemaining} {trialInfo.daysRemaining === 1 ? i18n.t('trial.dayRemaining') : i18n.t('trial.daysRemaining')}
      </Text>
    </View>
  </View>
)}
```

#### Trial Status Fetching
Trial status is fetched in three scenarios:
1. **Initial Load** (`fetchUserProfile`)
2. **Pull to Refresh** (`onRefresh`)
3. **Screen Focus** (`useFocusEffect`)

### 3. Translations

#### English (`src/translations/en.json`)
```json
"trial": {
  "title": "Sikiya Premium Free Trial",
  "message": "Please enjoy a free Sikiya Premium 7 days trial period. Hope you enjoy the conversations!",
  "dayRemaining": "day remaining",
  "daysRemaining": "days remaining"
}
```

#### French (`src/translations/fr.json`)
```json
"trial": {
  "title": "Essai gratuit Sikiya Premium",
  "message": "Profitez d'un essai gratuit de 7 jours de Sikiya Premium. Nous espérons que vous apprécierez les conversations !",
  "dayRemaining": "jour restant",
  "daysRemaining": "jours restants"
}
```

## Styling

### Trial Banner Styles
```javascript
trialBanner: {
  backgroundColor: '#E3F2FD',        // Light blue background
  marginHorizontal: 12,
  marginBottom: 12,
  padding: 16,
  borderRadius: 12,
  borderWidth: 1.5,
  borderColor: MainSecondaryBlueColor,
  flexDirection: 'row',
  alignItems: 'center',
}
```

### Icon Container
```javascript
trialIconContainer: {
  width: 60,
  height: 60,
  borderRadius: 30,
  backgroundColor: genBtnBackgroundColor,
  justifyContent: 'center',
  alignItems: 'center',
  marginRight: 16,
}
```

## User Experience Flow

### New User Signup
1. User completes signup form
2. Backend creates account with 7-day trial
3. User is redirected to profile screen
4. Trial banner appears immediately showing "7 days remaining"

### Daily Usage
1. User opens app and navigates to profile
2. Banner displays with updated days remaining
3. Example: Day 1: "7 days remaining"
4. Example: Day 5: "3 days remaining"
5. Example: Day 7: "1 day remaining"

### Trial Expiration
1. After 7 days, backend downgrades user to general role
2. On next app open or profile screen visit:
   - Trial status is fetched
   - `isOnTrial` returns false
   - Banner no longer displays
3. User now has general role limitations

### Upgrade During Trial
1. User navigates to membership screen
2. Purchases subscription
3. Backend cancels trial and maintains contributor role
4. On return to profile screen:
   - Trial status shows `isOnTrial: false`
   - Banner disappears
   - User has permanent contributor access

## API Integration

### Endpoints Used

#### Get Trial Status
```javascript
const response = await SikiyaAPI.get('/user/trial-status');
// Returns: { isOnTrial, trialStartDate, trialEndDate, daysRemaining, role }
```

#### Get User Info (includes trial)
```javascript
const response = await SikiyaAPI.get('/me');
// Returns: { role, email, verifiedEmail, isOnTrial, trialEndDate, daysRemaining }
```

## Testing Guide

### Manual Testing Checklist

#### Signup Flow
- [ ] Create new account
- [ ] Verify trial banner appears on profile screen
- [ ] Check banner shows "7 days remaining"
- [ ] Verify message text is correct and fully visible
- [ ] Test in both English and French

#### During Trial
- [ ] Navigate away and back to profile
- [ ] Banner should still be visible
- [ ] Pull to refresh - banner updates correctly
- [ ] Close app and reopen - banner appears
- [ ] Test on different screen sizes

#### Trial Expiration (Manual Simulation)
- [ ] Set trial end date to past in database
- [ ] Open app and navigate to profile
- [ ] Banner should NOT appear
- [ ] User should have general role

#### Upgrade Flow
- [ ] Start with trial active
- [ ] Purchase subscription
- [ ] Return to profile screen
- [ ] Banner should disappear
- [ ] Role should be contributor

### Automated Testing Ideas

```javascript
describe('Trial Banner', () => {
  it('displays when user is on trial', async () => {
    // Mock trial state
    const mockTrialInfo = { isOnTrial: true, daysRemaining: 5 };
    // Render UserProfileScreen
    // Assert banner is visible
  });

  it('hides when trial expires', async () => {
    // Mock expired trial
    const mockTrialInfo = { isOnTrial: false, daysRemaining: 0 };
    // Render UserProfileScreen
    // Assert banner is not visible
  });

  it('shows correct days remaining', async () => {
    // Mock trial with 3 days left
    const mockTrialInfo = { isOnTrial: true, daysRemaining: 3 };
    // Render UserProfileScreen
    // Assert "3 days remaining" text is visible
  });
});
```

## Troubleshooting

### Banner Not Showing

**Issue**: Trial banner doesn't appear for new users

**Solutions**:
1. Check if `fetchTrialStatus` is being called in `fetchUserProfile`
2. Verify API is returning trial data: `console.log(trialStatus)`
3. Check `trialInfo` state: `console.log(trialInfo)`
4. Ensure backend created user with trial enabled

**Debug Code**:
```javascript
const trialStatus = await fetchTrialStatus();
console.log('Trial Status:', trialStatus);
console.log('Trial Info State:', trialInfo);
```

### Wrong Days Remaining

**Issue**: Banner shows incorrect number of days

**Solutions**:
1. Check backend calculation in `/user/trial-status` endpoint
2. Verify timezone consistency between frontend and backend
3. Check that `daysRemaining` is being correctly set in state

### Banner Still Shows After Expiration

**Issue**: Banner visible even after trial should have expired

**Solutions**:
1. Check if `fetchTrialStatus` is being called on screen focus
2. Verify backend middleware is downgrading expired trials
3. Clear AsyncStorage and re-login
4. Check database - user should have `isOnTrial: false`

**Manual Fix**:
```javascript
// In app console or debug mode
await AsyncStorage.removeItem('isOnTrial');
await AsyncStorage.removeItem('trialEndDate');
// Re-login
```

### Translation Issues

**Issue**: Banner text not translating

**Solutions**:
1. Verify translation keys exist in both `en.json` and `fr.json`
2. Check i18n is imported: `import i18n from '../utils/i18n'`
3. Test language switching in app settings
4. Reload app after changing language

## Performance Considerations

### Optimization Tips

1. **Memoization**: Consider using `useMemo` for trial info if expensive calculations are added
2. **Debouncing**: If trial status is fetched too frequently, add debouncing
3. **Caching**: Trial info is cached in AsyncStorage to reduce API calls
4. **Conditional Rendering**: Banner only renders when truly needed (isOnTrial && daysRemaining > 0)

### Network Efficiency

- Trial status is fetched alongside profile data when possible
- No polling - updates only on user interaction (screen focus, refresh)
- AsyncStorage provides instant display while API call is in progress

## Accessibility

### Screen Reader Support
```javascript
<View 
  style={styles.trialBanner}
  accessible={true}
  accessibilityLabel={`${i18n.t('trial.title')}. ${i18n.t('trial.message')} ${trialInfo.daysRemaining} ${trialInfo.daysRemaining === 1 ? i18n.t('trial.dayRemaining') : i18n.t('trial.daysRemaining')}`}
  accessibilityRole="banner"
>
```

## Future Enhancements

### Potential Features

1. **Countdown Timer**: Show hours/minutes for last day
2. **Progress Bar**: Visual indicator of trial progress
3. **Dismiss Option**: Allow users to hide banner temporarily
4. **Animation**: Entrance animation when banner appears
5. **CTA Button**: "Upgrade Now" button in banner
6. **Trial Reminder**: Modal notification 3 days before expiration

### Example: Adding Countdown Timer
```javascript
const [timeRemaining, setTimeRemaining] = useState('');

useEffect(() => {
  if (trialInfo.isOnTrial && trialInfo.daysRemaining === 1) {
    const interval = setInterval(() => {
      const now = new Date();
      const end = new Date(authState.trialEndDate);
      const diff = end - now;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeRemaining(`${hours}h ${minutes}m remaining`);
    }, 60000); // Update every minute
    return () => clearInterval(interval);
  }
}, [trialInfo.daysRemaining]);
```

## Support

### Common Questions

**Q: Can I test trial expiration without waiting 7 days?**
A: Yes, manually update `trialEndDate` in database to a past date, then refresh the profile screen.

**Q: How do I reset a user's trial?**
A: In database, update user: 
```javascript
{ 
  isOnTrial: true, 
  hadTrial: false,
  trialStartDate: new Date(),
  trialEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
}
```

**Q: Does the banner appear for existing users?**
A: No, only users who signed up after this feature was implemented receive trials.

### Contact
For frontend issues related to the trial banner, check:
- `src/Screens/UserProfileScreen.js` - Banner display logic
- `src/Context/AuthContext.js` - Trial state management
- `src/translations/en.json` and `fr.json` - Banner text
