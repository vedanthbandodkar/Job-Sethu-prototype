
import { initializeApp, getApps, getApp, App, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import 'server-only';

let adminApp: App;

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : undefined;

// The storage bucket must always be provided.
const BUCKET_NAME = 'hire-ups-app.appspot.com';

if (!getApps().length) {
  if (serviceAccount) {
    // Running in a local server environment with a service account key
    adminApp = initializeApp({
      credential: cert(serviceAccount),
      storageBucket: BUCKET_NAME,
    });
  } else {
    // Running in a Vercel/Firebase Hosting environment.
    // The SDK automatically finds the project credentials, but we must specify the bucket.
    adminApp = initializeApp({
        storageBucket: BUCKET_NAME,
    });
  }
} else {
  adminApp = getApp();
}

const adminFirestore = getFirestore(adminApp);
const adminStorage = getStorage(adminApp);

export { adminApp, adminFirestore, adminStorage };
