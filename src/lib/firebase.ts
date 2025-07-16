
// In a real application, this file would initialize the Firebase SDK.
// For this mock-data prototype, it's not strictly necessary but is good practice
// to have in place for when you decide to connect to a real Firebase backend.

import { initializeApp, getApp, getApps } from "firebase/app";

// Your web app's Firebase configuration
// This is placeholder configuration. Replace it with your actual Firebase config.
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// In a real app, you would export auth and db instances here:
// import { getAuth } from "firebase/auth";
// import { getFirestore } from "firebase/firestore";
// export const auth = getAuth(app);
// export const db = getFirestore(app);

export { app };
