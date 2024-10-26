const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const app = express();
const PORT = 3000;

// Record audio using FFmpeg directly
function recordAudio(outputFilePath) {
    return new Promise((resolve, reject) => {
        const ffmpeg = spawn('ffmpeg', [
            '-y',
            '-f', 'dshow',
            '-i', 'audio=Microphone Array (Intel® Smart Sound Technology for Digital Microphones)', // Test without quotes or escape
            '-t', '5',
            '-acodec', 'pcm_s16le',
            '-ar', '44100',
            outputFilePath
        ]);           

        ffmpeg.stderr.on('data', (data) => {
            console.error(`FFmpeg error: ${data}`);
        });

        ffmpeg.on('error', (error) => {
            console.error(`Failed to start FFmpeg: ${error}`);
            reject(error);
        });

        ffmpeg.on('close', (code) => {
            if (code !== 0) {
                return reject(new Error(`FFmpeg exited with code ${code}`));
            }
            resolve();
        });
    });
}

// Trigger Whisper Python script
function transcribeAudio(audioFile) {
    return new Promise((resolve, reject) => {
        const pythonScript = `python whisper_recognize.py ${audioFile}`;
        exec(pythonScript, (error, stdout, stderr) => {
            if (error) {
                reject(stderr);
            } else {
                resolve(stdout.trim());
            }
        });
    });
}

// Endpoint to record and transcribe audio
app.get('/transcribe', async (req, res) => {
    const audioFilePath = path.join(__dirname, 'audio.wav');

    try {
        await recordAudio(audioFilePath);
        const transcription = await transcribeAudio(audioFilePath);
        res.json({ transcription });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
