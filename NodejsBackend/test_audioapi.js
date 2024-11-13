// To generate content, use this import path for GoogleGenerativeAI.
// Note that this is a different import path than what you use for the File API.
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize GoogleGenerativeAI with your API_KEY.
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

const audioFileUri = "D:\LLM-Voice-Extension\NodejsBackend\audio.wav";

// Initialize a Gemini model appropriate for your use case.
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

// Generate content using a prompt and the metadata of the uploaded file.
const result = await model.generateContent([
    {
      fileData: {
        mimeType: "audio/wav",
        fileUri: audioFileUri
      }
    },
    { text: "Generate a transcript of the speech." },
  ]);

// Print the response.
console.log(result.response.text())