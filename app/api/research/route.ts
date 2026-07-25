import { NextResponse } from "next/server";
import { model, fallbackModel } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const { topic } = await req.json();

    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    const startTime = Date.now();

    // Check if API keys are placeholders
    if (!process.env.TAVILY_API_KEY || process.env.TAVILY_API_KEY === 'YOUR_KEY_HERE' || 
        !process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'YOUR_KEY_HERE') {
      throw new Error("API Keys are missing. Please add your real TAVILY_API_KEY and GEMINI_API_KEY to the .env.local file to run the research backend.");
    }

    // 1. Search the web using Tavily
    const tavilyResponse = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: process.env.TAVILY_API_KEY,
        query: topic,
        search_depth: "advanced",
        include_images: false,
        include_answer: true,
        max_results: 10,
      }),
    });

    const searchData = await tavilyResponse.json();

    if (!tavilyResponse.ok) {
      console.error("Tavily API Error:", searchData);
      const detailStr = typeof searchData.detail === 'string' ? searchData.detail : JSON.stringify(searchData.detail);
      throw new Error(detailStr || "Search service failed. Please check your TAVILY_API_KEY.");
    }

    if (!searchData.results || searchData.results.length === 0) {
      throw new Error("No research results found for this topic. Try a more specific query.");
    }

    // 2. Prepare context for Gemini
    const searchContext = searchData.results
      .map((r: any) => `Source: ${r.title}\nURL: ${r.url}\nContent: ${r.content}`)
      .join("\n\n---\n\n");

    // 3. Generate Report using Gemini
    const prompt = `
      You are an expert academic research analyst and report writer.
      Your task is to generate a COMPLETE, PROFESSIONAL, and WELL-STRUCTURED research report on the topic: "${topic}".
      
      STRICT INSTRUCTIONS:
      - Follow a formal academic tone.
      - Ensure logical flow between sections.
      - Use clear hierarchical headings (e.g., 7.1, 7.2) for subsections.
      - Each section MUST be exhaustive. 
      - CRITICAL: You MUST use the "subsections" array to break down "Literature Review", "Detailed Analysis", and "Discussion" into at least 2-3 sub-topics each.
      - Include in-text citations like [1], [2] based on the input data.

      ========================
      INPUT DATA:
      ${searchContext}
      ========================
 
      Follow this JSON structure. Every section can have "subsections":
      {
        "title": "Clear and Professional Title",
        "summary": "150–200 words Abstract of the entire report",
        "sections": [
          { "title": "1. Introduction", "content": "..." },
          { "title": "2. Problem Statement", "content": "..." },
          { "title": "3. Objectives", "content": "List research objectives as a numbered list. Each objective MUST be on a NEW LINE starting with 1), 2), 3), etc. Example:\n1) Objective one.\n2) Objective two." },
          { 
            "title": "4. Literature Review", 
            "content": "Overall summary of literature.",
            "subsections": [
              { "subtitle": "4.1 Emerging Trends", "content": "..." },
              { "subtitle": "4.2 Historical Context", "content": "..." }
            ]
          },
          { "title": "5. Methodology", "content": "..." },
          { "title": "6. Key Findings", "content": "..." },
          { 
            "title": "7. Detailed Analysis", 
            "content": "Broad analysis overview.",
            "subsections": [
              { "subtitle": "7.1 Technical Implications", "content": "..." },
              { "subtitle": "7.2 Economic Impact", "content": "..." }
            ]
          },
          { 
            "title": "8. Discussion", 
            "content": "General discussion.",
            "subsections": [
              { "subtitle": "8.1 Comparison with Standards", "content": "..." },
              { "subtitle": "8.2 Future Outlook", "content": "..." }
            ]
          },
          { "title": "9. Conclusion", "content": "..." },
          { "title": "10. Recommendations", "content": "..." },
          { "title": "11. Limitations", "content": "..." },
          { "title": "12. References", "content": "List all sources numbered as [1], [2], etc. Each source MUST include a full, clickable URL (starting with https://). Format: [1] Title of Source - https://url.com" }
        ],
        "sources": [
          { "name": "[1] Title", "url": "URL" }
        ]
      }
      
      CRITICAL REQUIREMENTS: 
      - Use [1] style citations inside the content.
    `;

    let result;
    let rawText = "";
    let reportData = null;
    let attempt = 0;
    const maxRetries = 3;
    let delay = 2000;

    while (attempt < maxRetries) {
      try {
        // Use primary model for first attempt, fallback model for subsequent attempts
        const currentModel = attempt === 0 ? model : fallbackModel;
        result = await currentModel.generateContent(prompt);
        rawText = result.response.text().trim();
        // Strip markdown code fences if Gemini wraps the JSON in ```json ... ```
        const jsonText = rawText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
        reportData = JSON.parse(jsonText);
        break; // Success, exit loop
      } catch (err: any) {
        console.warn(`Gemini API attempt ${attempt + 1} failed:`, err.message);
        attempt++;
        if (attempt >= maxRetries) {
          throw new Error(`Failed to generate research report after ${maxRetries} attempts. Last error: ${err.message}`);
        }
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 1.5; // Exponential backoff
      }
    }

    const endTime = Date.now();
    const researchTime = ((endTime - startTime) / 1000).toFixed(1) + "s";

    // Add metadata
    const finalReport = {
      ...reportData,
      id: Math.random().toString(36).substring(7),
      generatedAt: new Date(),
      researchTime: researchTime
    };

    return NextResponse.json(finalReport);

  } catch (error: any) {
    console.error("Research API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
