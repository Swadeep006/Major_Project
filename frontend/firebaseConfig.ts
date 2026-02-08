import { initializeApp } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  Auth
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyC4yAsigG0SBpzzxafg0PceyT_Jk26Z1YA',
  authDomain: 'majorproject-efa10.firebaseapp.com',
  projectId: 'majorproject-efa10',
  storageBucket: 'majorproject-efa10.firebasestorage.app',
  messagingSenderId: '187223314326',
  appId: '1:187223314326:web:a023d1bf2b323117f2d7b7',
  measurementId: 'G-TW66F8VJW1',
};

const app = initializeApp(firebaseConfig);

let auth : Auth;
if (Platform.OS === 'web') {
  auth = getAuth(app);
} else {
  const { getReactNativePersistence } = require('firebase/auth');
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}

export { auth };
