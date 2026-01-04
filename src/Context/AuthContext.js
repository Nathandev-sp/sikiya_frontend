import createDataContext from './createDataContext';
import SikiyaAPI from '../../API/SikiyaAPI';

// Async storage for user data---------------------
import AsyncStorage from '@react-native-async-storage/async-storage';
import sleep from '../Helpers/Sleep';
//-------------------------------------------------

const authReducer = (state, action) => {
  switch (action.type) {
    case 'signup':
      return { 
        ...state,
        token: action.payload.token,
        role: action.payload.role,
        verifiedEmail: action.payload.verifiedEmail,
        errorMessage: '',
        email: action.payload.email || null 
      };
    case 'add_error':
      return { 
        ...state, 
        errorMessage: action.payload,
        //role: null,
        //token: null,
      };
    case 'signin':
      return { 
        ...state,
        token: action.payload.token,
        role: action.payload.role,
        verifiedEmail: action.payload.verifiedEmail,
        email: action.payload.email || null,
        errorMessage: '' 
      };
    case 'clear_error_message':
      return { 
        ...state, 
        errorMessage: '' 
      };
    case 'update_role':
      return { 
        ...state, 
        role: action.payload.role 
      };
    case 'verify_email':
      return {
        ...state,
        verifiedEmail: action.payload.verifiedEmail
      };
    case 'clear_state':
      return { 
        ...state, 
        token: null,
        role: null,
        verifiedEmail: false,
        email: null,
        errorMessage: ''
      };
    default:
      return state;
  }
};

// signup action function-----------------------------------
const signup = (dispatch) => async ({email, password, confirmPassword}) => {
  try {
    // Clear any existing errors first
    dispatch({ type: 'add_error', payload: '' });

    // Input validation
    if (!email || !password || !confirmPassword) {
      dispatch({ 
        type: 'add_error', 
        payload: 'Email, password, and confirm password are required.' 
      });
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      dispatch({ 
        type: 'add_error', 
        payload: 'Please enter a valid email address.' 
      });
      return;
    }

    // Password strength validation (optional)
    if (password.length < 8) {
      dispatch({ 
        type: 'add_error', 
        payload: 'Password must be at least 8 characters long.' 
      });
      return;
    }

    // Confirm password match validation
    if (password !== confirmPassword) {
      dispatch({ 
        type: 'add_error', 
        payload: 'Passwords do not match.' 
      });
      return;
    }


    // API call
    const response = await SikiyaAPI.post('/signup', {email, password});
    
    // Store token, role, AND verifiedEmail in AsyncStorage
    await sleep(500);
    await AsyncStorage.multiSet([
      ['token', response.data.token], 
      ['role', response.data.role || null],
      ['verifiedEmail', String(response.data.verifiedEmail || false)], // Add this - convert to string
      ['email', email] // Store email for later use
    ]);
    
    // Update state with token
    dispatch({ 
      type: 'signup', 
      payload: { 
        token: response.data.token,
        role: response.data.role || null,
        verifiedEmail: response.data.verifiedEmail || false, // Default to false
        email: email
      } 
    });

    try {
      await SikiyaAPI.post('/send-verification-code');
      console.log('Verification code sent successfully');
    } catch (verificationError) {
      console.log('Error sending verification code:', verificationError);
      // Don't fail the signup if email sending fails
      // User can request a new code later via "Resend Code"
    }

  } catch (err) {
    // Handle different types of errors ""
    const errorMessage = err.response?.status === 422 
      ? 'This email is already registered. Please sign in or use a different email.'
      : 'Something went wrong with sign up. Please try again later.';

    dispatch({
      type: 'add_error',
      payload: errorMessage
    });
  }
};
// -------------------------------------------------------------

// Signin action function---------------------------------------
const signin = (dispatch) => async ({email, password}) => {
  try {
    // Clear any existing errors first
    dispatch({ type: 'add_error', payload: '' });

    // Input validation
    if (!email || !password) {
      dispatch({ 
        type: 'add_error', 
        payload: 'Email and password are required.' 
      });
      return;
    }

    // API call
    const response = await SikiyaAPI.post('/signin', {email, password});
    
    // Store token first
    await AsyncStorage.setItem('token', response.data.token);
    
    // Fetch user info (role, email, verifiedEmail) from backend using token
    const userInfoResponse = await SikiyaAPI.get('/me');
    const userRole = userInfoResponse.data.role;
    const userEmail = userInfoResponse.data.email;
    const userVerifiedEmail = userInfoResponse.data.verifiedEmail;
    
    // Store token, role, AND verifiedEmail in AsyncStorage
    await AsyncStorage.multiSet([
      ['token', response.data.token], 
      ['role', userRole || null],
      ['verifiedEmail', String(userVerifiedEmail || false)],
      ['email', userEmail || email] // Use email from backend or fallback to input
    ]);
    await sleep(500);
    
    // Update state with token
    dispatch({ 
      type: 'signin', 
      payload: { 
        token: response.data.token,
        role: userRole,
        verifiedEmail: userVerifiedEmail || false,
        email: userEmail || email
      } 
    });

  } catch (err) {
    console.log("Hello from signin error:");
    // Handle different types of errors ""
    const errorMessage = err.response?.status === 422 
      ? 'Invalid email or password. Please try again.'
      : 'Something went wrong with sign in. Please try again later.';

    dispatch({
      type: 'add_error',
      payload: errorMessage
    });
  }
};
// -------------------------------------------------

// Clear error message function --------------------
const clearErrorMessage = (dispatch) => async () => {
  try {
    dispatch({ type: 'clear_error_message' });
  } catch (err) {
    console.log('Error clearing message:', err);
  }
};
// -------------------------------------------------

// verify email function (if needed) ---------------
const verifyEmail = (dispatch) => async ({ code }) => {
  console.log("Verifying email with code:", code);
  try {
    const response = await SikiyaAPI.post('/verify-email', { code });
    // Update verifiedEmail in AsyncStorage
    await AsyncStorage.setItem('verifiedEmail', 'true');
    // Update state
    dispatch({
      type: 'verify_email',
      payload: { verifiedEmail: true }
    });
  } catch (err) {
    dispatch({
      type: 'add_error',
      payload: err.response.data.error
    });
  }
};
// -------------------------------------------------

// Resend verification code ------------------------
const resendVerificationCode = (dispatch) => async () => {
  try {
    await SikiyaAPI.post('/resend-verification-code');
    console.log('Verification code resent successfully');
  } catch (err) {
    console.log('Error resending verification code:', err);
    dispatch({
      type: 'add_error',
      payload: err.response.data.error
    });
  }
};
// -------------------------------------------------
    

// Update role function (if needed) ----------------
const updateRole = (dispatch) => async (role) => {

  try {
    const response = await SikiyaAPI.patch('/update-role', { role });
    const newRole = response.data.user.role;

    await AsyncStorage.setItem('role', newRole);
    await sleep(500); // Optional delay for better UX

    dispatch({ 
      type: 'update_role', 
      payload: { role: newRole } 
    });
  } catch (err) {
    console.log('Error updating role:', err);
  }
};
// -------------------------------------------------

// clear token -------------------------------------
const clearState = (dispatch) => async () => {
  try {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('role');
    await AsyncStorage.removeItem('verifiedEmail');
    await AsyncStorage.removeItem('email');
    dispatch({ type: 'clear_state' });
  } catch (err) {
    console.log('Error clearing state:', err);
  }
};
// -------------------------------------------------

// clear token -------------------------------------
const signout = (dispatch) => async () => {
  try {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('role');
    await AsyncStorage.removeItem('verifiedEmail');
    await AsyncStorage.removeItem('email');
    dispatch({ type: 'clear_state' });
  } catch (err) {
    console.log('Error clearing state:', err);
  }
};
// -------------------------------------------------

// Add tryLocalSignin function (if you don't have it yet)
const tryLocalSignin = (dispatch) => async () => {
  try {
    // Safely get token from AsyncStorage - if it doesn't exist, it returns null (not an error)
    const token = await AsyncStorage.getItem('token');
    const storedEmail = await AsyncStorage.getItem('email');

    // If no token exists, this is normal - user just needs to sign in
    if (!token) {
      // No token found, user needs to sign in - this is not an error
      return;
    }

    try {
      // Fetch user info (role, email, verifiedEmail) from backend using token
      const userInfoResponse = await SikiyaAPI.get('/me');
      const userRole = userInfoResponse.data.role;
      const userEmail = userInfoResponse.data.email;
      const userVerifiedEmail = userInfoResponse.data.verifiedEmail;
      
      // Update AsyncStorage with fresh data from backend
      await AsyncStorage.multiSet([
        ['role', userRole || null],
        ['verifiedEmail', String(userVerifiedEmail || false)],
        ['email', userEmail || storedEmail || '']
      ]);
      
      dispatch({ 
        type: 'signin', 
        payload: { 
          token, 
          role: userRole,
          verifiedEmail: userVerifiedEmail || false,
          email: userEmail || storedEmail || null
        } 
      });
    } catch (err) {
      // If token is invalid or API call fails, clear everything silently
      // This could be due to expired token, network error, etc.
      console.log('Error fetching user info (token may be invalid):', err.message || err);
      try {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('role');
        await AsyncStorage.removeItem('verifiedEmail');
        await AsyncStorage.removeItem('email');
      } catch (clearErr) {
        // If clearing fails, that's okay - just log it
        console.log('Error clearing AsyncStorage:', clearErr.message || clearErr);
      }
      // Don't dispatch anything - user needs to sign in again
      // This is not an error state, just means user needs to authenticate
    }
  } catch (err) {
    // Handle any AsyncStorage errors gracefully
    // This could happen if AsyncStorage is unavailable, but it's not a critical error
    console.log('Error accessing AsyncStorage (this is normal if user hasn\'t logged in):', err.message || err);
    // Don't throw or dispatch error - just return silently
    // User will need to sign in, which is the expected behavior
  }
};

// Update the export
export const {Provider, Context} = createDataContext(
  authReducer,
  { signup, signin, clearErrorMessage, updateRole, tryLocalSignin, verifyEmail, resendVerificationCode, clearState, signout }, // Add tryLocalSignin
  { token: null, role: null, errorMessage: '', verifiedEmail: false, email: null } // Change null to false
);