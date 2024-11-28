import express from "express";
import { convertVideo, deleteProcessedVideoLocal, deleteRawVideoLocal, downloadRawVideo, setupDirectories, uploadProcessedVideo } from "./storage";
import { isVideoNew, setVideo } from "./firebase";



setupDirectories();

const app = express();
app.use(express.json())

app.post("/process-video", async (req, res) => {

  let data;
  try {
    const message = Buffer.from(req.body.message.data, "base64").toString("utf8");
    data = JSON.parse(message);
    if (!data.name) {
      throw new Error("Invalid message payload received.");
    }
  } catch (err) {
    console.log("Error:", err);
    res.status(400).send("Bad Request: missing file name.");
    return;
  }

  const inputFileName = data.name;
  const outputFileName = `processed-${inputFileName}`;
  const videoId = inputFileName.split(".")[0];

  if (!isVideoNew(videoId)) {
    res.status(400).send("Bad Request: video already processing or processed.");
    return;
  }

  // update status in Firestore
  setVideo(videoId, {
    id: videoId,
    uid: videoId.split("-")[0],
    status: "processing",
  });

  // download raw video from Cloud Storage buckets
  await downloadRawVideo(inputFileName);

  // transcode to 360p locally - could fail
  try {
    await convertVideo(inputFileName, outputFileName);
  } catch (err) {
    await Promise.all([
      // if transcoding fails, clean up local videos and bucket
      deleteRawVideoLocal(inputFileName),
      deleteProcessedVideoLocal(outputFileName),
    ]);
    console.log(err);
    res.status(500).send("Internal Server Error: video processing failed.");
    return;
  }

  // upload processed video to Cloud Storage
  await uploadProcessedVideo(outputFileName);

  // set 
  setVideo(videoId, {
    id: videoId,
    status: "processed",
    filename: outputFileName,
  });

  // clean up by deleting local files
  await Promise.all([
    deleteRawVideoLocal(inputFileName),
    deleteProcessedVideoLocal(outputFileName),
  ]);

  res.status(200).send(`Processing finished.`);
  return;
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(
    `Listening on http://localhost:${port}`
  );
});