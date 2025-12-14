import { GoogleGenAI, Type, Schema } from '@google/genai';
import { SYSTEM_INSTRUCTION } from '../constants';
import { IntentAnalysisResult } from '../types';

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

// JSON Schema for structured output
const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    intent: { type: Type.STRING, description: "The classified intent category." },
    confidence: { type: Type.NUMBER, description: "Confidence score between 0.0 and 1.0." },
    answer: { type: Type.STRING, description: "The matched FAQ answer, or null if OOS.", nullable: true },
    reasoning: { type: Type.STRING, description: "Brief explanation of why this intent was chosen." },
    suggestedSearchQuery: { type: Type.STRING, description: "An optimized search query if the request is Out-of-Scope.", nullable: true },
  },
  required: ["intent", "confidence", "reasoning"],
};

export const analyzeIntent = async (userQuery: string): Promise<IntentAnalysisResult> => {
  const ai = getClient();
  
  try {
    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: analysisSchema,
        temperature: 0.1, // Low temperature for deterministic classification
      },
      contents: [{
        role: 'user',
        parts: [{ text: userQuery }]
      }]
    });

    const text = result.text;
    if (!text) throw new Error("No response from model");
    
    return JSON.parse(text) as IntentAnalysisResult;
  } catch (error) {
    console.error("Intent Analysis Error:", error);
    // Fallback safe return
    return {
      intent: 'Error',
      confidence: 0,
      answer: null,
      reasoning: 'System error during classification',
      suggestedSearchQuery: userQuery
    };
  }
};

export const performWebSearch = async (query: string): Promise<{ text: string, links: Array<{title: string, url: string}> }> => {
  const ai = getClient();

  try {
    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      tools: [{ googleSearch: {} }],
      config: {
        systemInstruction: "You are a helpful assistant. Summarize the search results to answer the user's query politely.",
      },
      contents: [{
        role: 'user',
        parts: [{ text: query }]
      }]
    });

    const text = result.text || "I couldn't find any results.";
    
    // Extract grounding chunks for links
    const chunks = result.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const links = chunks
      .filter((c: any) => c.web?.uri && c.web?.title)
      .map((c: any) => ({ title: c.web.title, url: c.web.uri }));

    // Deduplicate links
    const uniqueLinks = Array.from(new Map(links.map((item: any) => [item.url, item])).values()) as Array<{title: string, url: string}>;

    return { text, links: uniqueLinks };
  } catch (error) {
    console.error("Search Error:", error);
    return { text: "I'm sorry, I encountered an error while searching the web.", links: [] };
  }
};
