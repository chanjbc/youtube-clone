import express from "express";
import { convertVideo, deleteProcessedVideo, deleteRawVideo, downloadRawVideo, setupDirectories, uploadProcessedVideo } from "./storage";



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
        res.status(400).send("Bad Request: missing file name!");
        return;
    }

    const inputFileName = data.name;
    const outputFileName = `processed-${inputFileName}`;

    // download raw video from cloud storage
    await downloadRawVideo(inputFileName);
    
    // convert to 360p locally - could fail
    try {
        await convertVideo(inputFileName, outputFileName);
    } catch (err) {
        await Promise.all([
            deleteRawVideo(inputFileName),
            deleteProcessedVideo(outputFileName)
        ]);
        console.log(err);
        res.status(500).send("Internal Server Error: video processing failed!");
        return;
    }

    // upload processed video to cloud storage
    await uploadProcessedVideo(outputFileName);

    // clean up by deleting local files
    await Promise.all([
        deleteRawVideo(inputFileName),
        deleteProcessedVideo(outputFileName)
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