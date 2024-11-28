import {httpsCallable} from "firebase/functions";
import {functions} from "./firebase";

const generateUploadUrl = httpsCallable(functions, "generateUploadUrl");
const getVideosFunction = httpsCallable(functions, "getVideos");

export interface Video {
  id: string,
  uid?: string,
  filename?: string,
  status?: "processing" | "processed",
  title?: string,
  description?: string
}

export interface GenerateUploadUrlResponse {
  url: string;
  fileName: string;
}

export async function uploadVideo(file: File) {

  // call Firebase function to generate signed URL
  const response = await generateUploadUrl({
    fileExtension: file.name.split(".").pop(),
  }) as { data: GenerateUploadUrlResponse };

  // use signed URL to upload file
  const uploadResult = await fetch(response?.data?.url, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type,
    },
  });

  return uploadResult;
}

export async function getVideos() {
  const response = await getVideosFunction();
  return response.data as Video[];
}
