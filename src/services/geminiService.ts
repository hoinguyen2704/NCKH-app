import { GoogleGenAI } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

export function getGeminiAI(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is missing. AI features will not work.");
    }
    aiInstance = new GoogleGenAI({ apiKey: apiKey || "" });
  }
  return aiInstance;
}

export async function explainDrugRepurposing(drugName: string, diseaseName: string): Promise<string> {
  try {
    const ai = getGeminiAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are a medical AI assistant. Briefly explain the potential biological mechanism of action of the drug "${drugName}" for treating the disease "${diseaseName}". Keep the explanation concise, scientific, and under 100 words. If there is no known mechanism, provide a plausible hypothesis based on the drug's known targets.`,
    });
    return response.text || "No explanation available.";
  } catch (error) {
    console.error("Error generating explanation:", error);
    return "Failed to generate explanation. Please try again later.";
  }
}

export async function askMedicalQuestion(question: string, context?: string): Promise<string> {
  try {
    const ai = getGeminiAI();
    const prompt = context 
      ? `Context: ${context}\n\nQuestion: ${question}\n\nYou are a medical AI assistant. Answer the question concisely and accurately.`
      : `Question: ${question}\n\nYou are a medical AI assistant. Answer the question concisely and accurately.`;
      
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text || "No answer available.";
  } catch (error) {
    console.error("Error answering question:", error);
    return "Failed to get an answer. Please try again later.";
  }
}
