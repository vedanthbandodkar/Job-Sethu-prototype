
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { initializeApp, getApp, getApps, FirebaseApp } from "firebase/app";
import { Auth, getAuth, onAuthStateChanged, User } from "firebase/auth";
import { Firestore, getFirestore } from "firebase/firestore";
import { firebaseConfig } from "./config";
import { ThemeProvider } from "@/components/theme-provider";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface FirebaseContextValue {
  app: FirebaseApp | null;
  auth: Auth | null;
  db: Firestore | null;
  user: User | null;
  loading: boolean;
}

const FirebaseContext = createContext<FirebaseContextValue>({
  app: null,
  auth: null,
  db: null,
  user: null,
  loading: true,
});

export const useFirebase = () => useContext(FirebaseContext);
export const useAuth = () => useFirebase().auth;
export const useFirestore = () => useFirebase().db;
export const useUser = () => {
    const { user, loading } = useFirebase();
    return { user, loading };
}


export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [app, setApp] = useState<FirebaseApp | null>(null);
  const [auth, setAuth] = useState<Auth | null>(null);
  const [db, setDb] = useState<Firestore | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const appInstance = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    setApp(appInstance);
    const authInstance = getAuth(appInstance);
    setAuth(authInstance);
    setDb(getFirestore(appInstance));

    const unsubscribe = onAuthStateChanged(authInstance, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (loading) return; // Don't do anything until Firebase auth state is loaded

    const protectedRoutes = !['/login', '/signup'].includes(pathname);

    if (!user && protectedRoutes) {
        router.replace('/login');
    } else if (user && !protectedRoutes) {
        router.replace('/dashboard');
    }

  }, [user, loading, pathname, router]);

  const value = { app, auth, db, user, loading };
  
  const isAuthPage = pathname === '/login' || pathname === '/signup';
  const showLoadingSpinner = loading && !isAuthPage;

  return (
    <FirebaseContext.Provider value={value}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
        {showLoadingSpinner ? (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        ) : children}
       </ThemeProvider>
    </FirebaseContext.Provider>
  );
}
