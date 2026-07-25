const { GoogleGenerativeAI } = require('@google/generative-ai');
const apiKey = 'AIzaSyAKsE0dx1X4yRSuSmw5mUPmVDBjwYCjiGg';
const genAI = new GoogleGenerativeAI(apiKey);

async function testModels() {
  const models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash-exp', 'gemini-2.0-flash'];
  for (const modelName of models) {
    console.log(`Testing model: ${modelName}...`);
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent('Verify');
      console.log(`✅ Success with ${modelName}: ${result.response.text().substring(0, 20)}...`);
      return modelName;
    } catch (err) {
      console.error(`❌ Error with ${modelName}: ${err.message}`);
    }
  }
}

testModels();
