import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

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
const auth = getAuth(app);

export { auth };
