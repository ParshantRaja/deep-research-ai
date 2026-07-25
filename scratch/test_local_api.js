async function testLocalApi() {
  console.log("Calling local research API...");
  try {
    const response = await fetch("http://localhost:3000/api/research", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        topic: "quantum computing basics"
      })
    });
    
    console.log("Status:", response.status);
    const data = await response.json();
    if (response.ok) {
      console.log("✅ SUCCESS!");
      console.log("Title:", data.title);
      console.log("Summary:", data.summary?.substring(0, 100) + "...");
      console.log("Sections count:", data.sections?.length);
    } else {
      console.log("❌ FAILED:");
      console.log(JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error("Fetch Error:", err);
  }
}

testLocalApi();
