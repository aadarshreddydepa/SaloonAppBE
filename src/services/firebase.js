// This file is the central point for initializing and configuring the Firebase SDK.

// Import the necessary functions from the Firebase SDKs
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import Config from 'react-native-config';

// --- IMPORTANT ---
// Your web app's Firebase configuration.
// You will get this from the Firebase console when you set up your project.
// Go to Project Settings > General > Your apps > Web app > SDK setup and configuration.
const firebaseConfig = {
  apiKey: Config.FIREBASE_API_KEY,
  authDomain: "mysaloonapp-157.firebaseapp.com",
  projectId: "mysaloonapp-157",
  storageBucket: "mysaloonapp-157.firebasestorage.app",
  messagingSenderId: "700188270421",
  appId: Config.FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;