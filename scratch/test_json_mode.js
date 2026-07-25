const { GoogleGenerativeAI } = require('@google/generative-ai');
const apiKey = 'AIzaSyAKsE0dx1X4yRSuSmw5mUPmVDBjwYCjiGg';
const genAI = new GoogleGenerativeAI(apiKey);

async function test() {
  console.log("Testing gemini-2.5-flash with JSON mode...");
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json"
      }
    });
    const result = await model.generateContent('Return a JSON object with a key "message" and value "hello"');
    console.log("✅ SUCCESS:");
    console.log(result.response.text());
  } catch (err) {
    console.error("❌ FAILED:", err.message);
  }
}

test();
