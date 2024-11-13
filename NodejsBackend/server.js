const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const app = express();
const PORT = 3000;

function recordAudio(outputFilePath) {
    return new Promise((resolve, reject) => {
        const ffmpeg = spawn('ffmpeg', [
            '-y', 
            '-f', 'dshow', 
            '-i', 'audio=Microphone Array (Intel® Smart Sound Technology for Digital Microphones)',
            '-acodec', 'pcm_s16le', 
            '-ar', '44100', 
            '-af', 'silencedetect=noise=-30dB:d=1',
            outputFilePath
        ]);

        ffmpeg.stderr.on('data', (data) => {
            const message = data.toString();
            console.error(`FFmpeg log: ${message}`);

            if (message.includes('silencedetect')) {
                if (message.includes('silence_start')) {
                    console.log("Silence detected, stopping recording...");
                    ffmpeg.kill('SIGINT');
                }
            }
        });

        ffmpeg.on('error', (error) => {
            console.error(`Failed to start FFmpeg: ${error}`);
            reject(error);
        });

        ffmpeg.on('close', (code) => {
            // if (code !== 0) {
            //     return reject(new Error(`FFmpeg exited with code ${code}`));
            // }
            resolve();
        });
    });
}

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

async function queryGemini(transcription) {
    try {
        const genAI = new GoogleGenerativeAI(process.env.API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = transcription;
        const result = await model.generateContent(prompt);
        return result.response.text();

    } catch (error) {
        throw new Error(`Gemini API request failed: ${error.message}`);
    }
  
}

// Endpoint to record and transcribe audio
app.get('/transcribe', async (req, res) => {
    const audioFilePath = path.join(__dirname, 'audio.wav');

    try {
        console.log("Helllo");
        await recordAudio(audioFilePath);
        const transcription = await transcribeAudio(audioFilePath);
        const geminiResponse = await queryGemini(transcription);
        res.json({ transcription, geminiResponse });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
