const express = require('express');
const fs = require("fs");
const path = require("path");

const app = express();

const CHUNK_SIZE = Math.pow(10, 6); // ES15. Alternative 10 ** 6; ES16 

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

app.get("/video", (req, res) => {
    // which part of video is requested
    const range = req.headers.range;
    // if range header is not present
    if (!range) {
        res.status(400).send("Requires Range Header");
    }
    // build media file directory path
    const mediaDir = path.join(__dirname + "/assets/media/VickyDonor.mp4");
    // get media file size
    const mediaFileSize = fs.statSync(mediaDir, { bigint: false, throwIfNoEntry: false }).size;
    const startByte = Number(range.replace(/\D/g, ""));
    // find minimum of mediafile size and start + CHUNK, Alternative (startByte+CHUNK_SIZE) >= mediaFileSize ? mediaFileSize : (startByte+CHUNK_SIZE);
    const endByte = Math.min(startByte + CHUNK_SIZE, mediaFileSize - 1);
    // data size in response
    const resMediaSize = endByte - startByte + 1;
    // build headers
    const headers = {
        "Content-Range": `bytes ${startByte}-${endByte}/${mediaFileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": resMediaSize,
        "Content-Type": "video/mp4"
    };
    // add headers to response, 206 means partial content
    res.writeHead(206, headers);
    const videoStream = fs.createReadStream(mediaDir, { start: startByte, end: endByte });
    videoStream.pipe(res);
});

app.listen(7770, () => {
    console.log("server running on port 7770");
});