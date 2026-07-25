async function testModel(modelName) {
  const apiKey = 'AIzaSyAKsE0dx1X4yRSuSmw5mUPmVDBjwYCjiGg';
  const url = `https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${apiKey}`;
  
  const body = {
    contents: [{ parts: [{ text: "Hi" }] }]
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    return { status: response.status, data };
  } catch (err) {
    return { error: err.message };
  }
}

async function run() {
  const models = [
    "models/gemini-2.5-flash",
    "models/gemini-2.5-pro",
    "models/gemini-2.0-flash",
    "models/gemini-2.0-flash-001",
    "models/gemini-2.0-flash-lite-001",
    "models/gemini-2.0-flash-lite",
    "models/gemini-flash-latest",
    "models/gemini-flash-lite-latest",
    "models/gemini-pro-latest",
    "models/gemini-2.5-flash-lite",
    "models/gemini-3.5-flash"
  ];

  for (const m of models) {
    console.log(`Testing ${m}...`);
    const res = await testModel(m);
    if (res.status === 200) {
      console.log(`✅ SUCCESS: ${m}`);
      console.log("Response:", JSON.stringify(res.data.candidates?.[0]?.content?.parts?.[0]?.text));
    } else {
      console.log(`❌ FAILED: ${m} (Status ${res.status})`);
      console.log("Error details:", JSON.stringify(res.data?.error || res.error));
    }
    console.log("-----------------------------------------");
  }
}

run();
