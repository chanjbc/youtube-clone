"use client";

import styles from "./sign-in.module.css";
import { signInWithGoogle, signOut } from "../firebase/firebase";

export default function SignIn() {
    return (
        <div>
            <button className={styles.signin} onClick={signOut}>
                Sign Out
            </button>
            <button className={styles.signin} onClick={signInWithGoogle}>
                Sign In
            </button>
        </div>
    )
}