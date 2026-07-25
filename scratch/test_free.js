const { GoogleGenerativeAI } = require('@google/generative-ai');
const apiKey = 'AIzaSyAKsE0dx1X4yRSuSmw5mUPmVDBjwYCjiGg';
const genAI = new GoogleGenerativeAI(apiKey);

async function testFreeModels() {
  // Trying with full model paths
  const models = ['models/gemini-1.5-flash', 'models/gemini-1.5-pro', 'models/gemini-pro'];
  for (const modelName of models) {
    console.log(`Testing: ${modelName}...`);
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent('Hi');
      console.log(`✅ WORKING: ${modelName}`);
      return modelName;
    } catch (err) {
      console.error(`❌ FAILED: ${modelName} - ${err.message}`);
    }
  }
}

testFreeModels();
