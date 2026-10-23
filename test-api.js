const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("Error: Please set GEMINI_API_KEY environment variable.");
  process.exit(1);
}

async function test() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: "Explain how AI works in a few words" }] }]
    })
  });
  const data = await response.json();
  if (data.candidates && data.candidates[0]) {
    console.log("Response:", data.candidates[0].content.parts[0].text);
  } else {
    console.log("Error or unexpected format:", JSON.stringify(data, null, 2));
  }
}

test();
