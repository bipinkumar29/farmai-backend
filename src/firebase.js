import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// TODO: Replace with your actual Firebase project configuration from the Firebase Console
// Guide: Go to https://console.firebase.google.com/
// Create Project -> Register App -> Settings (Gear icon) -> General -> Config
const firebaseConfig = {
  apiKey: "AIzaSyBYN8HgKwZTh26O6w75gzS0pkKMUpC9S8s",
  authDomain: "farmai-05.firebaseapp.com",
  projectId: "farmai-05",
  storageBucket: "farmai-05.firebasestorage.app",
  messagingSenderId: "913594419299",
  appId: "1:913594419299:web:bf0c3d78c4d59df3e65056",
  measurementId: "G-20XKJNFEMB"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
