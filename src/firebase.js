// Client-side Firebase Auth setup. This only handles the Google/Apple sign-in
// popup and hands the resulting ID token to our own backend, which verifies
// it with firebase-admin (see backend/config/firebase.js) before issuing our
// own JWT. Firebase itself never sees or stores any app data.
//
// Requires `firebase` to be added to package.json:
//   npm install firebase
//
// And these Vite env vars (get them from Firebase console > Project settings):
//   VITE_FIREBASE_API_KEY
//   VITE_FIREBASE_AUTH_DOMAIN
//   VITE_FIREBASE_PROJECT_ID
//   VITE_FIREBASE_APP_ID
import { initializeApp, getApps } from 'firebase/app'
import {
    getAuth,
    GoogleAuthProvider,
    OAuthProvider,
    signInWithPopup,
} from 'firebase/auth'

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const firebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId)

const app = firebaseConfigured
    ? getApps()[0] || initializeApp(firebaseConfig)
    : null

const auth = app ? getAuth(app) : null

/**
 * Opens the Google sign-in popup and returns a Firebase ID token, or throws
 * if Firebase hasn't been configured yet (see .env.example).
 */
export const signInWithGoogle = async () => {
    if (!auth) throw new Error('Google sign-in is not configured yet (missing VITE_FIREBASE_* env vars)')
    const result = await signInWithPopup(auth, new GoogleAuthProvider())
    return result.user.getIdToken()
}

/**
 * Opens the Apple sign-in popup and returns a Firebase ID token. Apple sign-in
 * must also be enabled under Firebase console > Authentication > Sign-in method.
 */
export const signInWithApple = async () => {
    if (!auth) throw new Error('Apple sign-in is not configured yet (missing VITE_FIREBASE_* env vars)')
    const result = await signInWithPopup(auth, new OAuthProvider('apple.com'))
    return result.user.getIdToken()
}

export default auth
