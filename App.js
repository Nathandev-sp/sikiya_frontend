import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from "./src/Screens/HomeScreen"; // Home screen
import JounalistPannelScreen from './src/Screens/JounalistPannelScreen'; // Saved screen
import LiveNews from './src/Screens/LiveNews'; // Live news screen
import SearchScreenHello from './src/Screens/SearchScreen'; // Search screen
import UserProfileScreen from './src/Screens/UserProfileScreen'
import SettingsScreen from './src/Screens/UserProfileScreens/SettingsScreen'; // Settings screen
import AuthorProfileScreen from './src/Screens/SecondaryScreens/AuthorProfileScreen';
import { NavigationContainer } from '@react-navigation/native'
import Ionicons from '@expo/vector-icons/Ionicons';

import * as Font from 'expo-font'; // Font import
import {useFonts} from 'expo-font'; // Font import
import { useEffect, useState, useRef, useContext } from 'react'; // React imports

// News screens imports ----------------------------
import NewsHome from "./src/Screens/NewsScreens/NewsHome"; // News home screen
import NewsCategoryScreen from './src/Screens/NewsScreens/NewsCategoryScreen';
import NotificationCenterScreen from './src/Screens/NotificationCenterScreen'; // Notification center
// --------------------------------------------------

import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

import { StatusBar } from 'react-native';
import AppScreenBackgroundColor, { MainBrownSecondaryColor, MainSecondaryColor } from './src/styles/GeneralAppStyle';

// Authentication imports----------------------------
import loginScreen from './src/Screens/AuthScreens/LoginScreen';
import SignupScreen from './src/Screens/AuthScreens/SignupScreen';
import ForgotPasswordScreen from './src/Screens/AuthScreens/ForgotPasswordScreen';
import EmailConfirmationScreen from './src/Screens/AuthScreens/EmailConfirmationScreen';
import OnboardingScreen from './src/Screens/AuthScreens/OnboardingScreen';
import GeneralUserJoinScreen from './src/Screens/AuthScreens/UserJoinScreens/GeneralUserJoinScreen';
import TermAndConditionsScreen from './src/Screens/AuthScreens/TermAndConditionsScreen';
import JournalistJoinScreen1 from './src/Screens/AuthScreens/UserJoinScreens/JournalistJoinScreen1';
import JournalistJoinScreen2 from './src/Screens/AuthScreens/UserJoinScreens/JournalistJoinScreen2 copy';
import PremiumUserJoinScreen from './src/Screens/AuthScreens/UserJoinScreens/PremiumUserJoinScreen';
import JournalistFinishJoinScreen from './src/Screens/AuthScreens/UserJoinScreens/JournalistFinishJoinScreen';
import JournalistTermConditionScreen from './src/Screens/AuthScreens/JournalistTermConditions';
// --------------------------------------------------

// Journalist panel screen imports ----------------------------
import NewArticleScreen from './src/Screens/JounalistPannelScreens/NewArticleScreen';
import NewShortVideoScreen from './src/Screens/JounalistPannelScreens/NewShortVideoScreen';
import NewArticleImageScreen from './src/Screens/JounalistPannelScreens/NewArticleImageScreen';
import NewArticleDisclaimerScreen from './src/Screens/JounalistPannelScreens/NewArticleDisclaimer';
import NewVideoDisclaimerScreen from './src/Screens/JounalistPannelScreens/NewVideoDisclaimerScreen';
import NewVideoTitleScreen from './src/Screens/JounalistPannelScreens/NewVideoTitleScreen';
//import NewVideoScreen from './src/Screens/JounalistPannelScreens/NewVideoScreen';

// --------------------------------------------------

// Settings screen imports ----------------------------
import ProfileSettingScreen from './src/Screens/UserProfileScreens/ProfileSettingScreen';
import MembershipSettingScreen from './src/Screens/UserProfileScreens/MembershipSettingScreen';
import GeneralSettingScreen from './src/Screens/UserProfileScreens/GeneralSettingScreen';
import PaymentMethodSettingScreen from './src/Screens/UserProfileScreens/PaymentMethodSettingScreen';
import CommentHistorySettingScreen from './src/Screens/UserProfileScreens/CommentHistorySettingScreen';
import LanguageSettingScreen from './src/Screens/UserProfileScreens/LanguageSettingScreen';
import HelpSupportSettingScreen from './src/Screens/UserProfileScreens/HelpSupportSettingScreen';
import NotificationPreferencesScreen from './src/Screens/UserProfileScreens/NotificationPreferencesScreen';
import UserFollowScreen from './src/Screens/UserProfileScreens/UserFollowScreen';
// --------------------------------------------------

// Ref imports ----------------------------------
import { setNavigator, getNavigator } from './src/Helpers/NavigationRef';
// --------------------------------------------------

// Pre-loading screens imports ----------------------------------
import AppPreloadingScreen from './src/Screens/AppPreloadingScreen';
import NetworkErrorScreen from './src/Screens/ErrorScreens/NetworkErrorScreen';
import CriticalErrorScreen from './src/Screens/ErrorScreens/CriticalErrorScreen';
// --------------------------------------------------

// context imports ----------------------------------
import { Provider as AuthProvider } from './src/Context/AuthContext'; // Auth context provider
import { Context as AuthContext } from './src/Context/AuthContext'; // Auth context
import { LanguageProvider } from './src/Context/LanguageContext'; // Language context provider
import sleep from './src/Helpers/Sleep';
import SikiyaAPI from './API/SikiyaAPI';
import { 
  initializePushNotifications, 
  setupNotificationListeners 
} from './src/services/notificationService';
// --------------------------------------------------

// AdMob initialization ----------------------------------
let GoogleMobileAds;
try {
  GoogleMobileAds = require('react-native-google-mobile-ads').default;
} catch (error) {
  console.warn('react-native-google-mobile-ads not available:', error.message);
  GoogleMobileAds = null;
}
// --------------------------------------------------


// General user signup stack -------------------------
const GeneraluserJoinStack = createNativeStackNavigator();

function GeneralUserJoinStackNav() {
  return (
    <GeneraluserJoinStack.Navigator
      screenOptions={{ headerShown: false }}>
        <GeneraluserJoinStack.Screen name="GeneralUserJoin" component={GeneralUserJoinScreen} />
        <GeneraluserJoinStack.Screen name="TermsaCont" component={TermAndConditionsScreen} />
      </GeneraluserJoinStack.Navigator>
  )};
// --------------------------------------------------

// Journalist signup stack -------------------------
const JournalistJoinStack = createNativeStackNavigator();

function JournalistJoinStackNav() {
  return (
    <JournalistJoinStack.Navigator
      screenOptions={{ headerShown: false }}>
      <JournalistJoinStack.Screen name="JournalistJoin1" component={JournalistJoinScreen1} />
      <JournalistJoinStack.Screen name="JournalistJoin2" component={JournalistJoinScreen2} />
      <JournalistJoinStack.Screen name="JournalistTermConditions" component={JournalistTermConditionScreen} />
      <JournalistJoinStack.Screen name="JournalistFinishJoin" component={JournalistFinishJoinScreen} />
    </JournalistJoinStack.Navigator>
  )};



// Getting started with the app ----------------------
const gettingStartedStack = createNativeStackNavigator();

function GettingStartedStackNav() {
  return (
    <gettingStartedStack.Navigator
      screenOptions={{ headerShown: false }}
    >
      <gettingStartedStack.Screen name="Onboarding" component={OnboardingScreen} />
      <gettingStartedStack.Screen name="GeneralUserJoinStack" component={GeneralUserJoinStackNav} />
      <gettingStartedStack.Screen name="JournalistJoinStack" component={JournalistJoinStackNav} />
    </gettingStartedStack.Navigator>
  );
};
// ---------------------------------------------------



//// Authentication section-----------------------------------------------------------------------------------------------
const AuthStack = createNativeStackNavigator();

function AuthStackNavigator() {
  return (
    <AuthStack.Navigator
      screenOptions={{ }}
    >
      <AuthStack.Screen name="Login" component={loginScreen} options={{headerShown: false}} />
      <AuthStack.Screen name="Signup" component={SignupScreen} options={{headerShown: false}} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{headerShown: false}} />
    </AuthStack.Navigator>
  );
};
//// ---------------------------------------------------------------------------------------------------------------------

//// Email confirmation screen stack -----------------------------------------------------------------------------------------------
const EmailConfirmationStack = createNativeStackNavigator();

function EmailConfirmationStackNav() {
  return (
    <EmailConfirmationStack.Navigator
      screenOptions={{}}
    >
      <EmailConfirmationStack.Screen name="EmailConfirmation" component={EmailConfirmationScreen} options={{headerShown: false}}/>
    </EmailConfirmationStack.Navigator>
  );
};

// Home Stack Navigator -------------------------
const Stack = createNativeStackNavigator();

function HomeStack({preloadedHomeArticles, preloadedHeadlines}) {
  return (
    <Stack.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: '#04698F', borderBottomWidth: 0, shadowOpacity: 0 }, // Change header background color
        headerTintColor: '#fff', // Change header text color
      })}
      >
      <Stack.Screen name="HomeScreen" component={HomeScreen} options={{headerShown: false}} initialParams={{preloadedHomeArticles, preloadedHeadlines}}/>
      <Stack.Screen name="NewsHome" component={NewsHome} options={{headerShown: false}} />
      <Stack.Screen name="AuthorProfile" component={AuthorProfileScreen} options={{headerShown: false}} />
      <Stack.Screen name="AuthorProfileScreen" component={AuthorProfileScreen} options={{headerShown: false}} />
      <Stack.Screen name="NewsCategory" component={NewsCategoryScreen} options={{headerShown: false}} />
      <Stack.Screen name="NotificationCenter" component={NotificationCenterScreen} options={{headerShown: false}} />

    </Stack.Navigator>
  );
}
// Closing the Home Stack Navigator -------------------------

// Live News Stack Navigator -------------------------
const LiveNewsStack = createNativeStackNavigator();

function LiveNewsStackNav({preloadedVideos}) {
  return (
    <LiveNewsStack.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: '#04698F', borderBottomWidth: 0, shadowOpacity: 0 },
        headerTintColor: '#fff',
      })}
    >
      <LiveNewsStack.Screen name="LiveNews" component={LiveNews} options={{headerShown: false}} initialParams={{preloadedVideos}} />
      <LiveNewsStack.Screen name="AuthorProfile" component={AuthorProfileScreen} options={{headerShown: false}} />
      <LiveNewsStack.Screen name="AuthorProfileScreen" component={AuthorProfileScreen} options={{headerShown: false}} />
      <LiveNewsStack.Screen name="NotificationCenter" component={NotificationCenterScreen} options={{headerShown: false}} />
    </LiveNewsStack.Navigator>
  );
}
// Closing the Live News Stack Navigator -------------------------

// Search Stack Navigator -------------------------
const SearchStack = createNativeStackNavigator();

function SearchStackNav({preloadedSearchJournalist, preloadedSearchArticles}) {
  return (
    <SearchStack.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: '#04698F', borderBottomWidth: 0, shadowOpacity: 0 },
        headerTintColor: '#fff',
      })}
    >
      <SearchStack.Screen name="SearchScreen" component={SearchScreenHello} options={{headerShown: false}} initialParams={{preloadedSearchJournalist, preloadedSearchArticles}} />
      <SearchStack.Screen name="AuthorProfile" component={AuthorProfileScreen} options={{headerShown: false}} />
      <SearchStack.Screen name="AuthorProfileScreen" component={AuthorProfileScreen} options={{headerShown: false}} />
      <SearchStack.Screen name="NewsHome" component={NewsHome} options={{headerShown: false}} />
      <SearchStack.Screen name="NotificationCenter" component={NotificationCenterScreen} options={{headerShown: false}} />
    </SearchStack.Navigator>
  );
}
// Closing the Search Stack Navigator -------------------------

// Subscription Stack Navigator -------------------------
const SubscriptionStack = createNativeStackNavigator();
function SubscriptionStackNav() {
  return (
    <SubscriptionStack.Navigator
      screenOptions={{ headerShown: false }}
    >
      <SubscriptionStack.Screen name="MembershipSettings" component={MembershipSettingScreen} options={{headerShown: false}} />
      <SubscriptionStack.Screen name="PaymentMethodSettings" component={PaymentMethodSettingScreen} options={{headerShown: false}} />    
    </SubscriptionStack.Navigator>
  );
}
// Closing the Subscription Stack Navigator -------------------------

// Live News Stack Navigator -------------------------
const JournalistPanelStack = createNativeStackNavigator();

function JournalistPanelStackNav() {
  return (
    <JournalistPanelStack.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: '#04698F', borderBottomWidth: 0, shadowOpacity: 0 }, // Change header background color
        headerTintColor: '#fff', // Change header text color
      })}
      >
      <JournalistPanelStack.Screen name="JournalistPanel" component={JounalistPannelScreen} options={{headerShown: false}}/>
      <JournalistPanelStack.Screen name="NewArticleDisclaimer" component={NewArticleDisclaimerScreen} options={{headerShown: false}} />
      <JournalistPanelStack.Screen name="NewArticle" component={NewArticleScreen} options={{headerShown: false}} />
      <JournalistPanelStack.Screen name="NewArticleImage" component={NewArticleImageScreen} options={{headerShown: false}} />
      <JournalistPanelStack.Screen name="NewVideoDisclaimer" component={NewVideoDisclaimerScreen} options={{headerShown: false}} />
      <JournalistPanelStack.Screen name="NewVideoTitle" component={NewVideoTitleScreen} options={{headerShown: false}} />
      <JournalistPanelStack.Screen name="NewVideo" component={NewShortVideoScreen} options={{headerShown: false}} />
      <JournalistPanelStack.Screen name="NotificationCenter" component={NotificationCenterScreen} options={{headerShown: false}} />
    </JournalistPanelStack.Navigator>
  )
}
// Closing the Journalist Panel Stack Navigator -------------------------

// User Profile Stack Navigator -------------------------
const UserProfileStack = createNativeStackNavigator();

function UserProfileStackNav({preloadedUserProfile}) {
  return (
    <UserProfileStack.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: '#04698F', borderBottomWidth: 0, shadowOpacity: 0 }, // Change header background color
        headerTintColor: '#fff', // Change header text color
      })}
      >
      <UserProfileStack.Screen name="UserProfile" component={UserProfileScreen} options={{headerShown: false}} initialParams={{preloadedUserProfile}}/>
      <UserProfileStack.Screen name="UserFollow" component={UserFollowScreen} options={{headerShown: false}} />
      <UserProfileStack.Screen name="Settings" component={SettingsScreen} options={{headerShown: false}} />
      <UserProfileStack.Screen name="ProfileSettings" component={ProfileSettingScreen} options={{headerShown: false}} />
      <UserProfileStack.Screen name="SubscriptionSettings" component={SubscriptionStackNav} options={{headerShown: false}} />
      <UserProfileStack.Screen name="GeneralSettings" component={GeneralSettingScreen} options={{headerShown: false}} />
      
      <UserProfileStack.Screen name="CommentSettings" component={CommentHistorySettingScreen} options={{headerShown: false}} />
      <UserProfileStack.Screen name="LanguageSettings" component={LanguageSettingScreen} options={{headerShown: false}} />
      <UserProfileStack.Screen name="NotificationPreferences" component={NotificationPreferencesScreen} options={{headerShown: false}} />
      <UserProfileStack.Screen name="NotificationCenter" component={NotificationCenterScreen} options={{headerShown: false}} />
      <UserProfileStack.Screen name="HelpSupportSettings" component={HelpSupportSettingScreen} options={{headerShown: false}} />
    </UserProfileStack.Navigator>
  )
}
// Closing the User Profile Stack Navigator -------------------------



// Creating the botton tab navuigator -------------------------
const Tab = createBottomTabNavigator()

function MyTabs({preloadedHomeArticles, preloadedSearchJournalist, preloadedSearchArticles, preloadedUserProfile, preloadedShortVideos, preloadedJournalistData, preloadedHeadlines, preloadedVideos}) {

  //Implementing restricted access so that jounalists can see their articles
  const { state } = useContext(AuthContext);
  const isJournalist = state.role === 'journalist';
  
 
    return (
   
      <Tab.Navigator
        screenOptions={({ route, navigation }) => {
          // Check if we're in a submission screen by looking at the navigation state
          const state = navigation.getState();
          let shouldHideTabBar = false;
          
          if (state) {
            const currentRoute = state.routes[state.index];
            if (currentRoute?.name === 'Journalist panel' && currentRoute?.state) {
              const nestedState = currentRoute.state;
              const nestedRoute = nestedState.routes?.[nestedState.index];
              const currentScreenName = nestedRoute?.name;
              const hideTabBarScreens = ['NewArticle', 'NewArticleImage', 'NewVideoTitle', 'NewVideo'];
              shouldHideTabBar = hideTabBarScreens.includes(currentScreenName);
            }
          }

          return {
          tabBarIcon: ({ focused, color}) => {
            let icon;
            const onColor = MainBrownSecondaryColor  //#9D7340 #2B4570 #AD7520
            const offColor = 'gray'
  
            if (route.name === 'Home') {
              icon = focused ? <Ionicons name="home" size={23} color={onColor} /> : <Ionicons name="home-outline" size={22} color={offColor} />
              return icon
  
            } else if (route.name === 'Journalist panel') {
              icon = focused ? <Ionicons name="albums" size={23} color={onColor} /> : <Ionicons name="albums-outline" size={22} color={offColor} />;
              return icon
  
            } else if (route.name === 'Live') {
              icon = focused ? <Ionicons name="play-circle" size={26} color={onColor} /> : <Ionicons name="play-circle-outline" size={25} color={offColor} />;
              return icon 
  
            } else if (route.name === 'Search') {
              icon = focused ? <Ionicons name="search" size={24} color={onColor} /> : <Ionicons name="search-outline" size={23} color={offColor} />;
              return icon

            } else if (route.name === 'UserProfileGroup') {
              icon = focused ? <Ionicons name="person" size={22} color={onColor} /> : <Ionicons name="person-outline" size={21} color={offColor} />;
              return icon
            }
        },
        tabBarActiveTintColor: 'black',
        tabBarInactiveTintColor: 'gray',
        tabBarShowLabel: false,
        tabBarStyle: shouldHideTabBar ? { display: 'none' } : {
          backgroundColor: AppScreenBackgroundColor,  //#02040F rich black #111944 #0E0308nice black
          height: 70,
          paddingTop: 6,
        },
        };
        }}
        >
        <Tab.Screen name="Home" options={{headerShown: false}}>
          {() => <HomeStack preloadedHomeArticles={preloadedHomeArticles} preloadedHeadlines={preloadedHeadlines} />}
        </Tab.Screen>
        <Tab.Screen name="Live" options={{headerShown: false}}>
          {() => <LiveNewsStackNav preloadedVideos={preloadedVideos} />}
        </Tab.Screen>
        <Tab.Screen name="Search" options={{headerShown: false}}> 
          {() => <SearchStackNav preloadedSearchJournalist={preloadedSearchJournalist} preloadedSearchArticles={preloadedSearchArticles} />}
        </Tab.Screen>
        {isJournalist ? (<Tab.Screen name="Journalist panel" component={JournalistPanelStackNav} options={{headerShown: false}} />) : null}
        <Tab.Screen name="UserProfileGroup" options={{headerShown: false}}>
          {() => <UserProfileStackNav preloadedUserProfile={preloadedUserProfile} />}
        </Tab.Screen>
      </Tab.Navigator>
   
    );
   
  }

// Closing the bottom tab navigator -------------------------


// Create a separate component for the content that needs context
const AppContent = () => {
  const { state, tryLocalSignin } = useContext(AuthContext);
  const [errorState, setErrorState] = useState(null); // { type: 'network' | 'critical', message: string }
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [retryKey, setRetryKey] = useState(0); // Key to force re-run of preload

  // Initializing preloading states --------------------------
  const [preloadedHomeArticles, setPreloadedHomeArticles] = useState(null);
  const [preloadedSearchJournalist, setPreloadedSearchJournalist] = useState(null);
  const [preloadedSearchArticles, setPreloadedSearchArticles] = useState(null);
  const [preloadedUserProfile, setPreloadedUserProfile] = useState(null);
  const [preloadedShortVideos, setPreloadedShortVideos] = useState(null);
  const [preloadedJournalistData, setPreloadedJournalistData] = useState(null);
  const [preloadedHeadlines, setPreloadedHeadlines] = useState(null);
  const [preloadedVideos, setPreloadedVideos] = useState(null);
  // ----------------------------------------------------------

  //trying to signin locally
  useEffect(() => {
    // Safety timeout - always finish loading after 10 seconds max
    const safetyTimeout = setTimeout(() => {
      console.log('Safety timeout reached - forcing app to load');
      setIsAppLoading(false);
    }, 10000);

    const preloadApp = async () => {
      try {
        // Try to sign in locally - this will gracefully handle if there's no token
        try {
          await tryLocalSignin();
        } catch (err) {
          // If tryLocalSignin fails, it's not critical - user just needs to sign in
          console.log('Local signin check completed (user may need to sign in):', err.message || err);
        }
        
        // Initialize push notifications (only if user is authenticated)
        if (state.token) {
          try {
            await initializePushNotifications();
          } catch (err) {
            console.log('Push notification initialization failed (non-critical):', err.message || err);
          }
        }
        
        // Initialize AdMob
        if (GoogleMobileAds) {
          try {
            await GoogleMobileAds().initialize();
            console.log('AdMob initialized successfully');
          } catch (err) {
            console.log('AdMob initialization failed (non-critical):', err.message || err);
          }
        }
        
        // Add any preload for the app - make each call independent so failures don't block the app
        // Use Promise.allSettled so one failure doesn't stop others
        const preloadPromises = [
          // Public endpoints - can load without auth
          SikiyaAPI.get('articles/home').then(res => res.data).catch(err => {
            console.log('Failed to load home articles:', err.message);
            // Check for network or critical errors
            if (err.isNetworkError) {
              setErrorState({ type: 'network' });
            } else if (err.isCriticalError) {
              setErrorState({ type: 'critical', message: 'Server error. Please try again later.' });
            }
            return null;
          }),
          SikiyaAPI.get('/journalists/random').then(res => res.data).catch(err => {
            console.log('Failed to load journalists:', err.message);
            if (err.isNetworkError && !errorState) {
              setErrorState({ type: 'network' });
            } else if (err.isCriticalError && !errorState) {
              setErrorState({ type: 'critical', message: 'Server error. Please try again later.' });
            }
            return null;
          }),
          SikiyaAPI.get('/article/search').then(res => res.data).catch(err => {
            console.log('Failed to load search articles:', err.message);
            if (err.isNetworkError && !errorState) {
              setErrorState({ type: 'network' });
            } else if (err.isCriticalError && !errorState) {
              setErrorState({ type: 'critical', message: 'Server error. Please try again later.' });
            }
            return null;
          }),
          SikiyaAPI.get('/articles/home/headlines').then(res => res.data).catch(err => {
            console.log('Failed to load headlines:', err.message);
            if (err.isNetworkError && !errorState) {
              setErrorState({ type: 'network' });
            } else if (err.isCriticalError && !errorState) {
              setErrorState({ type: 'critical', message: 'Server error. Please try again later.' });
            }
            return null;
          }),
          SikiyaAPI.get('videos/home?page=1&limit=5').then(res => res.data).catch(err => {
            console.log('Failed to load videos:', err.message);
            if (err.isNetworkError && !errorState) {
              setErrorState({ type: 'network' });
            } else if (err.isCriticalError && !errorState) {
              setErrorState({ type: 'critical', message: 'Server error. Please try again later.' });
            }
            return null;
          }),
        ];

        // Only load user profile if user is authenticated
        if (state.token) {
          preloadPromises.push(
            SikiyaAPI.get('/user/profile/').then(res => res.data).catch(err => {
              console.log('Failed to load user profile:', err.message);
              return null;
            })
          );
        }

        // Wait for all calls with timeout (8 seconds max total)
        let results;
        try {
          results = await Promise.race([
            Promise.allSettled(preloadPromises),
            new Promise((resolve) => {
              setTimeout(() => {
                console.log('Preload timeout - continuing anyway');
                resolve(preloadPromises.map(() => ({ status: 'rejected', reason: 'Timeout' })));
              }, 8000); // 8 second timeout
            })
          ]);
        } catch (err) {
          console.log('Error in preload promises:', err);
          results = preloadPromises.map(() => ({ status: 'rejected', reason: 'Error' }));
        }

        // Set data from results
        if (Array.isArray(results)) {
          if (results[0]?.status === 'fulfilled' && results[0].value) {
            setPreloadedHomeArticles(results[0].value);
          }
          if (results[1]?.status === 'fulfilled' && results[1].value) {
            setPreloadedSearchJournalist(results[1].value);
          }
          if (results[2]?.status === 'fulfilled' && results[2].value) {
            setPreloadedSearchArticles(results[2].value);
          }
          if (results[3]?.status === 'fulfilled' && results[3].value) {
            setPreloadedHeadlines(results[3].value);
          }
          if (results[4]?.status === 'fulfilled' && results[4].value) {
            setPreloadedVideos(results[4].value);
          }
          if (state.token && results[5]?.status === 'fulfilled' && results[5].value) {
            setPreloadedUserProfile(results[5].value);
          }
        }

        // Small delay to show loading screen briefly
        await sleep(1000); // 1 second minimum loading time
      } catch (error) {
        console.error("Error preloading app:", error);
        // Even if there's an error, continue loading the app
      } finally {
        // Always set loading to false, even if everything fails
        console.log('Preloading complete, showing app');
        clearTimeout(safetyTimeout); // Clear safety timeout since we're done
        setIsAppLoading(false);
      }
    };

    preloadApp();

    // Cleanup safety timeout on unmount
    return () => {
      clearTimeout(safetyTimeout);
    };
  }, [state.token, retryKey]); // Re-run if token changes or retry is triggered

  // Set up notification listeners
  useEffect(() => {
    // Handle notifications when app is in foreground
    const handleNotificationReceived = (notification) => {
      console.log('Notification received in foreground:', notification);
      // You can add custom handling here, e.g., show an in-app banner
    };

    // Handle when user taps on a notification
    const handleNotificationTapped = (response) => {
      console.log('User tapped notification:', response);
      const data = response.notification.request.content.data;
      
      if (!data || !data.type) {
        console.warn('Notification data missing or invalid');
        return;
      }

      // Use a small delay to ensure navigation is ready
      setTimeout(() => {
        try {
          // Get navigation from the ref
          const navigation = getNavigator();
          if (!navigation) {
            console.warn('Navigation not available');
            return;
          }

          // Navigate based on notification type
          // Note: We need to navigate to the tab first, then to the screen within that stack
          if (data.type === 'new_article') {
            if (data.articleId) {
              // Navigate to Home tab, then to NewsHome screen
              navigation.navigate('Home', {
                screen: 'NewsHome',
                params: { articleId: data.articleId }
              });
            }
          } else if (data.type === 'article_approved') {
            if (data.articleId) {
              // Navigate to Home tab, then to NewsHome screen for approved articles
              navigation.navigate('Home', {
                screen: 'NewsHome',
                params: { articleId: data.articleId }
              });
            }
          } else if (data.type === 'new_video') {
            if (data.videoId) {
              // Navigate to Live tab, then to LiveNews screen
              navigation.navigate('Live', {
                screen: 'LiveNews',
                params: { videoId: data.videoId }
              });
            }
          } else if (data.type === 'video_approved') {
            if (data.videoId) {
              // Navigate to Live tab, then to LiveNews screen for approved videos
              navigation.navigate('Live', {
                screen: 'LiveNews',
                params: { videoId: data.videoId }
              });
            }
          } else if (data.type === 'new_comment' || data.type === 'comment_reply') {
            if (data.articleId) {
              navigation.navigate('Home', {
                screen: 'NewsHome',
                params: { articleId: data.articleId }
              });
            } else if (data.videoId) {
              navigation.navigate('Live', {
                screen: 'LiveNews',
                params: { videoId: data.videoId }
              });
            }
          } else if (data.type === 'new_follower') {
            if (data.followerId) {
              // Navigate to Home tab, then to AuthorProfile screen
              navigation.navigate('Home', {
                screen: 'AuthorProfile',
                params: { userId: data.followerId }
              });
            }
          } else if (data.type === 'article_first_like' || data.type === 'article_milestone_likes' || data.type === 'article_milestone_comments') {
            if (data.articleId) {
              // Navigate to Home tab, then to NewsHome screen
              navigation.navigate('Home', {
                screen: 'NewsHome',
                params: { articleId: data.articleId }
              });
            }
          } else if (data.type === 'video_milestone_comments') {
            if (data.videoId) {
              // Navigate to Live tab, then to LiveNews screen
              navigation.navigate('Live', {
                screen: 'LiveNews',
                params: { videoId: data.videoId }
              });
            }
          } else if (data.type === 'article_rejected' || data.type === 'video_rejected') {
            // Navigate to journalist panel for rejected content
            navigation.navigate('Journalist');
          } else if (data.type === 'article_approved') {
            // Navigate to NewsHome for approved articles (same as new_article)
            if (data.articleId) {
              navigation.navigate('Home', {
                screen: 'NewsHome',
                params: { articleId: data.articleId }
              });
            }
          } else if (data.type === 'video_approved') {
            // Navigate to LiveNews for approved videos (same as new_video)
            if (data.videoId) {
              navigation.navigate('Live', {
                screen: 'LiveNews',
                params: { videoId: data.videoId }
              });
            }
          }
        } catch (error) {
          console.error('Error navigating from notification:', error);
        }
      }, 500);
    };

    // Set up listeners
    const subscriptions = setupNotificationListeners(
      handleNotificationReceived,
      handleNotificationTapped
    );

    // Cleanup listeners on unmount
    return () => {
      subscriptions.forEach(subscription => subscription.remove());
    };
  }, []);

  // Show error screens if there's an error
  if (errorState) {
    if (errorState.type === 'network') {
      return (
        <NetworkErrorScreen 
          onRetry={() => {
            setErrorState(null);
            // Retry by re-initializing the app
            setIsAppLoading(true);
            setRetryKey(prev => prev + 1); // Trigger useEffect to re-run
          }} 
        />
      );
    } else if (errorState.type === 'critical') {
      return (
        <CriticalErrorScreen 
          onRetry={() => {
            setErrorState(null);
            // Retry by re-initializing the app
            setIsAppLoading(true);
            setRetryKey(prev => prev + 1); // Trigger useEffect to re-run
          }}
          errorMessage={errorState.message}
        />
      );
    }
  }

  if (isAppLoading) {
    // You can implement a splash screen or loading indicator here
    return <AppPreloadingScreen />; // or a loading component
  }

  //


  console.log("AppContent state:", state);

  return (
    <NavigationContainer ref={(nav) => setNavigator(nav)}>
      {!state.token ? (
        <AuthStackNavigator />
      ) : state.verifiedEmail === false ? (
        <EmailConfirmationStackNav />
      ) : !state.role || state.role === null || state.role === "needID" ? (
        <GettingStartedStackNav />
      ) : (
        <MyTabs preloadedHomeArticles={preloadedHomeArticles} preloadedSearchJournalist={preloadedSearchJournalist} preloadedSearchArticles={preloadedSearchArticles} preloadedUserProfile={preloadedUserProfile} preloadedShortVideos={preloadedShortVideos} preloadedJournalistData={preloadedJournalistData} preloadedHeadlines={preloadedHeadlines} preloadedVideos={preloadedVideos} />
      )}
    </NavigationContainer>
  );
};

// Binding everyting into the final app component -------------------------
export default function App() {
  const [fontsloaded] = useFonts({
    'Philosopher-Regular': require('./assets/Fonts/Philosopher-Regular.ttf'),
    'Montserrat-Black': require('./assets/Fonts/Montserrat-Black.ttf'),
    'Montserrat-Medium': require('./assets/Fonts/Montserrat-Medium.ttf'),
    'Oswald-SemiBold': require('./assets/Fonts/Oswald-SemiBold.ttf'),
    'OpenSans-Regular': require('./assets/Fonts/OpenSans-Regular.ttf'),
    'OpenSans-Medium': require('./assets/Fonts/OpenSans-Medium.ttf'),
    'OpenSans-SemiBold': require('./assets/Fonts/OpenSans-SemiBold.ttf'),
    'OpenSans-LightItalic': require('./assets/Fonts/OpenSans-LightItalic.ttf'),
    'Lobster-Regular': require('./assets/Fonts/Lobster-Regular.ttf'),
    'LexendTera-Regular': require('./assets/Fonts/LexendTera-Regular.ttf'),
    'SUSEMono-SemiBold': require('./assets/Fonts/SUSEMono-SemiBold.ttf'),
    'SUSEMono-Medium': require('./assets/Fonts/SUSEMono-Medium.ttf'),
    'GoblinOne-Regular': require('./assets/Fonts/GoblinOne-Regular.ttf'),
    'GravitasOne-Regular': require('./assets/Fonts/GravitasOne-Regular.ttf'),
    'Unlock-Regular': require('./assets/Fonts/Unlock-Regular.ttf'),
    'NotoSans-LightItalic': require('./assets/Fonts/NotoSans-LightItalic.ttf'),
    'NotoSans-MediumItalic': require('./assets/Fonts/NotoSans-MediumItalic.ttf'),
    'NotoSans-SemiBoldItalic': require('./assets/Fonts/NotoSans-SemiBoldItalic.ttf'),
  });

  if (!fontsloaded) {
    return null;
  }
 
  return (
    <AuthProvider>
      <LanguageProvider>
        <StatusBar barStyle="dark-content" backgroundColor="white" />
        <AppContent />
      </LanguageProvider>
    </AuthProvider>
  );
 
}
// Closing the final app component -------------------------