import express from "express";
import ffmpeg from "fluent-ffmpeg";

const app = express();
app.use(express.json())

app.post("/process-video", (req, res) => {
    const inputFilePath = req.body.inputFilePath;
    const outputFilePath = req.body.outputFilePath;
    
    // missing input/output data
    if (!inputFilePath) {
        res.status(400).send("Bad request: missing input file path");
    } else if (!outputFilePath) {
        res.status(400).send("Bad request: missing output file path");
    }
    

    
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(
        `Listening on http://localhost:${port}`
    );
});