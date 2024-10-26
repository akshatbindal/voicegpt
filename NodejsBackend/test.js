const { exec } = require('child_process');
const path = require('path');

// Record audio using FFmpeg
function recordWithFFmpeg(outputFilePath) {
    return new Promise((resolve, reject) => {
        // Change the command for Windows
        const command = `ffmpeg -f dshow -i audio="Microphone Array (Intel® Smart Sound Technology for Digital Microphones)" -t 5 ${outputFilePath}`;
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(stderr);
            } else {
                resolve();
            }
        });
    });
}

// Example usage
const audioFilePath = path.join(__dirname, 'audio.wav');
recordWithFFmpeg(audioFilePath)
    .then(() => console.log('Recording finished'))
    .catch(err => console.error('Error during recording:', err));
