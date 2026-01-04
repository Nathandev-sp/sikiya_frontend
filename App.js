import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from "./src/Screens/HomeScreen"; // Home screen
import JounalistPannelScreen from './src/Screens/JounalistPannelScreen'; // Saved screen
import LiveNews from './src/Screens/LiveNews'; // Live news screen
import SearchScreen from './src/Screens/SearchScreen'; // Search screen
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
import UserFollowScreen from './src/Screens/UserProfileScreens/UserFollowScreen';
// --------------------------------------------------

// Ref imports ----------------------------------
import { setNavigator } from './src/Helpers/NavigationRef';
// --------------------------------------------------

// Pre-loading screens imports ----------------------------------
import AppPreloadingScreen from './src/Screens/AppPreloadingScreen';
// --------------------------------------------------

// context imports ----------------------------------
import { Provider as AuthProvider } from './src/Context/AuthContext'; // Auth context provider
import { Context as AuthContext } from './src/Context/AuthContext'; // Auth context
import sleep from './src/Helpers/Sleep';
import SikiyaAPI from './API/SikiyaAPI';
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
      <Stack.Screen name="NewsCategory" component={NewsCategoryScreen} options={{headerShown: false}} />

    </Stack.Navigator>
  );
}
// Closing the Home Stack Navigator -------------------------

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
        screenOptions={({ route }) => ({

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
        tabBarStyle: {
          backgroundColor: AppScreenBackgroundColor,  //#02040F rich black #111944 #0E0308nice black
          height: 70,
          paddingTop: 6,
        },
      })}
        >
        <Tab.Screen name="Home" options={{headerShown: false}}>
          {() => <HomeStack preloadedHomeArticles={preloadedHomeArticles} preloadedHeadlines={preloadedHeadlines} />}
        </Tab.Screen>
        <Tab.Screen name="Live" options={{headerShown: false}}>
          {() => <LiveNews preloadedVideos={preloadedVideos} />}
        </Tab.Screen>
        <Tab.Screen name="Search" options={{headerShown: false}}> 
          {() => <SearchScreen preloadedSearchJournalist={preloadedSearchJournalist} preloadedSearchArticles={preloadedSearchArticles} />}
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
  const [isAppLoading, setIsAppLoading] = useState(true);

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
    const preloadApp = async () => {
      try {
        // Try to sign in locally - this will gracefully handle if there's no token
        try {
          await tryLocalSignin();
        } catch (err) {
          // If tryLocalSignin fails, it's not critical - user just needs to sign in
          console.log('Local signin check completed (user may need to sign in):', err.message || err);
        }
        
        // Add any preload for the app
        const homeArticlesResponse = await SikiyaAPI.get('articles/home');
        setPreloadedHomeArticles(homeArticlesResponse.data);
        const preloadedSearchJournalistResponse = await SikiyaAPI.get('/journalists/random');
        setPreloadedSearchJournalist(preloadedSearchJournalistResponse.data);
        const preloadedSearchArticlesResponse = await SikiyaAPI.get('/article/search');
        setPreloadedSearchArticles(preloadedSearchArticlesResponse.data);
        const userProfileResponse = await SikiyaAPI.get('/user/profile/');
        setPreloadedUserProfile(userProfileResponse.data);
        const preloadedHeadlinesResponse = await SikiyaAPI.get('/articles/home/headlines');
        setPreloadedHeadlines(preloadedHeadlinesResponse.data);
        // Preload first 5 videos for LiveNews screen
        const preloadedVideosResponse = await SikiyaAPI.get('videos/home?page=1&limit=5');
        setPreloadedVideos(preloadedVideosResponse.data);
        // Simulate other preloading tasks if necessary

        //console.log("Preloaded home articles:", preloadedHomeArticles);

        await sleep(40); // Simulate a delay for preloading
      } catch (error) {
        console.error("Error preloading app:", error);
      }finally{
        setIsAppLoading(false);
      }
    };

    preloadApp();
  }, []);

  if (isAppLoading) {
    // You can implement a splash screen or loading indicator here
    return <AppPreloadingScreen />; // or a loading component
  }

  //


  console.log("AppContent state:", state);

  return (
    <NavigationContainer>
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
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <AppContent />
    </AuthProvider>
  );
 
}
// Closing the final app component -------------------------