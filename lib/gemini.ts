import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "BUILD_TIME_DUMMY_KEY");

export const model = genAI.getGenerativeModel({ 
  model: "gemini-3.5-flash",
  generationConfig: {
    responseMimeType: "application/json",
  }
});

export const fallbackModel = genAI.getGenerativeModel({
  model: "gemini-flash-latest",
  generationConfig: {
    responseMimeType: "application/json",
  }
});
