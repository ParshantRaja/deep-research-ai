async function listModelsRaw() {
  const apiKey = 'AIzaSyAKsE0dx1X4yRSuSmw5mUPmVDBjwYCjiGg';
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  
  console.log("Listing models via raw fetch...");
  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log("Response Status:", response.status);
    console.log("Available Models:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Fetch Error:", err);
  }
}

listModelsRaw();
