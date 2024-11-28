import { Storage } from "@google-cloud/storage";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";



const storage = new Storage();

// GCP buckets
const rawVideoBucketName = "chanjbc-raw-video-bucket";
const processedVideoBucketName = "chanjbc-processed-video-bucket";

// local directories within container
const localRawVideoPath = "./raw-video";
const localProcessedVideoPath = "./processed-video";



/**
 * Creates local repositories for local raw/processed videos, using {@function ensureDirectoryExistence}
*/
export function setupDirectories() {
  ensureDirectoryExistence(localRawVideoPath);
  ensureDirectoryExistence(localProcessedVideoPath);
}

/**
 * Checks if a directory exists, creating if necessary
 * @param dirPath - directory path to check
 */
function ensureDirectoryExistence(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    // use recursive to create nested directories
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Directory ${dirPath} created successfully.`);
  }
}



/**
 * Deletes a raw video locally using {@function deleteFile}
 * @param fileName - name of file to delete
 * @returns a promise that resolves once the file has been deleted
 */
export function deleteRawVideoLocal(fileName: string) {
  return deleteFile(`${localRawVideoPath}/${fileName}`);
}

/**
 * Deletes a processed video locally using {@function deleteFile}
 * @param fileName - name of file to delete
 * @returns a promise that resolves once the file has been deleted
 */
export function deleteProcessedVideoLocal(fileName: string) {
  return deleteFile(`${localProcessedVideoPath}/${fileName}`);
}

/**
 * Deletes a file locally
 * @param filePath - path of file to delete
 * @returns a promise that resolves once the file has been deleted
 */
function deleteFile(filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(filePath)) {
      // use fs unlink to delete
      fs.unlink(filePath, (err) => {
        if (err) {
          console.log(`Failed to delete file at ${filePath}:`, err)
          reject(err);
        } else {
          console.log(`File at ${filePath} deleted!`);
          resolve();
        }
      })
    } else {
      // even if not found, still resolve
      console.log(`File ${filePath} not found: skipping delete!`);
      resolve();
    }
  })
}



/**
 * Downloads a raw video from GCP {@link rawVideoBucketName} into local directory {@link localRawVideoPath}
 * @param fileName - name of the file to download
 * @returns a promise that resolves when the file has been downloaded
 */
export async function downloadRawVideo(fileName: string) {
  await storage.bucket(rawVideoBucketName)
    .file(fileName)
    .download({ destination: `${localRawVideoPath}/${fileName}` });
  // GCP buckets start with gs
  console.log(`gs://${rawVideoBucketName}/${fileName} downloaded to ${localRawVideoPath}/${fileName}`);
}

/**
 * Uploads a processed video from local directory {@link localProcessedVideoPath} to GCP {@link processedVideoBucketName}, and additionally makes the video publicly viewable
 * @param fileName - name of the file to upload
 * @returns a promise that resolves when the file has been uploaded
 */
export async function uploadProcessedVideo(fileName: string) {
  const bucket = storage.bucket(processedVideoBucketName);

  await bucket.upload(`${localProcessedVideoPath}/${fileName}`, {
    destination: fileName
  })
  await bucket.file(fileName).makePublic();
  console.log(`${localProcessedVideoPath}/${fileName} uploaded to gs://${processedVideoBucketName}/${fileName}`);
}



/**
 * Uses ffmpeg to convert a video to 360p (done locally within container)
 * @param rawVideoName - name of the raw video to convert, located at local directory {@link localRawVideoPath}
 * @param processedVideoName - name of the processed video, which should be placed into local directory {@link localProcessedVideoPath}
 * @returns a promise that resolves when the video has been converted 
 */
export function convertVideo(rawVideoName: string, processedVideoName: string) {
  return new Promise<void>((resolve, reject) => {
    ffmpeg(`${localRawVideoPath}/${rawVideoName}`)
      .outputOptions("-vf", "scale=-1:360") // downscale to 360p
      .on("end", () => {
        console.log("Video processed succesfully!");
        resolve();
      })
      .on("error", (err) => {
        console.log("Error: ", err);
        reject(err);
      })
      .save(`${localProcessedVideoPath}/${processedVideoName}`);
  })
}
