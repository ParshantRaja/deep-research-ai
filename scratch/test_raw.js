async function testRawFetch() {
  const apiKey = 'AIzaSyAKsE0dx1X4yRSuSmw5mUPmVDBjwYCjiGg';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  
  const body = {
    contents: [{ parts: [{ text: "Hi" }] }]
  };

  console.log("Testing raw fetch...");
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    
    const data = await response.json();
    console.log("Response Status:", response.status);
    console.log("Response Data:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Fetch Error:", err);
  }
}

testRawFetch();
