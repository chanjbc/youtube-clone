"use client";

import Image from "next/image";
import Link from "next/link";
import styles from "./navbar.module.css";
import SignIn from "./sign-in"

import { onAuthStateChangedHelper } from "../firebase/firebase";
import { User } from "firebase/auth";
import { Fragment, useEffect, useState } from "react";
import Upload from "./upload";


export default function Navbar() {

  // init user state to null
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChangedHelper((user) => {
      setUser(user);
    });
    
    // clean up subscription on unmount
    return () => unsubscribe();
  }, []);

  return (
    <Fragment>
      <nav className={styles.nav}>
        <Link href="/">
          <Image width={90} height={20} src="/youtube-logo.svg" alt="YouTube Logo" />
        </Link>
        <div className={styles.buttonContainer}>
          {user && <Upload />}
          <SignIn user={user} />
        </div>
      </nav>
      {!user && <div style={{textAlign: "center"}}>Sign in to upload a video</div>}
    </Fragment>
  );
}
