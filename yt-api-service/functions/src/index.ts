import {initializeApp} from "firebase-admin/app";
import {Firestore} from "firebase-admin/firestore";
import {auth, https} from "firebase-functions/v1";
import {UserRecord} from "firebase-functions/lib/common/providers/identity";
import * as logger from "firebase-functions/logger";

import {Storage} from "@google-cloud/storage";
import {onCall} from "firebase-functions/https";

initializeApp();

// GCP buckets
const firestore = new Firestore();
const storage = new Storage();
const rawVideoBucketName = "chanjbc-raw-video-bucket";

// Firestore collection containing videos
const videoCollectionId = "videos";

export interface Video {
  id: string,
  uid?: string,
  filename?: string,
  status?: "processing" | "processed",
  title?: string,
  description?: string
}

export const createUser = auth.user().onCreate((user: UserRecord) => {
  const userInfo = {
    uid: user.uid,
    email: user.email,
    photoUrl: user.photoURL,
  };

  // add record, creating collections and document if not present
  firestore.collection("users").doc(user.uid).set(userInfo);
  logger.info(`User created: ${JSON.stringify(userInfo)}`);
  return;
});

/**
 * Creates a signed url that allows users to upload to the raw videos bucket
 * @returns the url and the new file name
 */
export const generateUploadUrl = onCall({maxInstances: 1}, async (request) => {
  // check if user is authenticated
  if (!request.auth) {
    throw new https.HttpsError(
      "failed-precondition",
      "User must be authenticated."
    );
  }

  const auth = request.auth;
  const data = request.data;
  const bucket = storage.bucket(rawVideoBucketName);

  // generate unique file name
  const fileName = `${auth.uid}-${Date.now()}.${data.fileExtension}`;

  const [url] = await bucket.file(fileName).getSignedUrl({
    version: "v4",
    action: "write",
    // expires in 15 min
    expires: Date.now() + 15*60*1000,
  });

  return {url, fileName};
});

/**
 * @returns Firestore docs for up to 10 videos
 */
export const getVideos = onCall({maxInstances: 1}, async () => {
  const snapshot = 
    await firestore.collection(videoCollectionId).limit(10).get();
  return snapshot.docs.map((doc) => doc.data());
});
