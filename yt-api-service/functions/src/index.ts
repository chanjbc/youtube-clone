import {initializeApp} from "firebase-admin/app";
import {Firestore} from "firebase-admin/firestore";
import {auth, https} from "firebase-functions/v1";
import {UserRecord} from "firebase-functions/lib/common/providers/identity";
import * as logger from "firebase-functions/logger";

import {Storage} from "@google-cloud/storage";
import {onCall} from "firebase-functions/https";

initializeApp();

const firestore = new Firestore();
const storage = new Storage();

// GCP buckets
const rawVideoBucketName = "chanjbc-raw-video-bucket";

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
 * 
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
    expires: Date.now() + 15^60*1000
  });

  return {url, fileName}
});
