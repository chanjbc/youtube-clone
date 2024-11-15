import { Storage } from "@google-cloud/storage";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";


const storage = new Storage();

const rawVideoBucketName = "raw-video-bucket-jbc";
const processedVideoBucketName = "processed-video-bucket-jbc";

const localRawVideoPath = "./raw-video";
const localProcessedVideoPath = "./processed-video";



/**
 * Create local repositories for local raw/processed videos.
 */
export function setupDirectories() {

}

/**
 * @param rawVideoName - name of the video to convert from {@link localRawVideoPath}
 * @param processedVideoName - name of the file to conver tot {@link localProcessedVideoPath}
 * @returns a promise that resolves when the video has been converted 
 */
export function convertVideo(rawVideoName: string, processedVideoName: string) {
    ffmpeg(`${localRawVideoPath}/${rawVideoName}`)
        .outputOptions("-vf", "scale=-1:360") // downscale to 360p
        .on("end", () => {
            res.status(200).send("Video processed succesfully")        
        })
        .on("error", (err) => {
            console.log("Error: ", err);
            res.status(500).send("Internal server error");
        })
        .save(`${localProcessedVideoPath}/${processedVideoName}`);
}
