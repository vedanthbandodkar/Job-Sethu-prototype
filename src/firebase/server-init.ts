import { initializeApp, getApps, getApp, App, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import 'server-only';

let adminApp: App;

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : undefined;

if (!getApps().length) {
  if (serviceAccount) {
    // Running in a server environment, use service account
    adminApp = initializeApp({
      credential: cert(serviceAccount),
      storageBucket: `${serviceAccount.project_id}.appspot.com`,
    });
  } else {
    // Running in a Vercel/Firebase Hosting environment
    adminApp = initializeApp();
  }
} else {
  adminApp = getApp();
}

const adminFirestore = getFirestore(adminApp);
const adminStorage = getStorage(adminApp);

export { adminApp, adminFirestore, adminStorage };
