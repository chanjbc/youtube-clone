// Import the functions you need from the SDKs you need
// TODO: fix this
import { initializeApp } from "firebase/app";
import {
    getAuth,
    signInWithPopup,
    GoogleAuthProvider,
    onAuthStateChanged,
    User
} from "firebase/auth";


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDkJDhjTyo3iIyuZHmyNxUfQXTvyBaXgG4",
    authDomain: "yt-clone-3cd30.firebaseapp.com",
    projectId: "yt-clone-3cd30",
    appId: "1:475659724945:web:4279914f47bb3c8cbdf730",
    measurementId: "G-GWWSPCRFWM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

/**
 * Signs a user in with Google auth popup
 * @returns a promise that resolves with the user's credentials 
 */
export function signInWithGoogle() {
    return signInWithPopup(auth, new GoogleAuthProvider());
}

/**
 * Signs out a user
 * @returns a promise thtat resolves when the user has signed out
 */
export function signOut() {
    return auth.signOut();
}

/**
 * Trigger a callback when the user auth state changes
 * @returns a function to unsubscribe callback
 */
export function onAuthStateChangedHelper(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
}