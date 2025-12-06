import { GoogleGenAI } from "@google/genai";
import { GeminiModel } from "../types";
import { DEFAULT_PROMPT_TEMPLATE } from "../constants";

// Helper to strip the data:image/xyz;base64, prefix for the API
const stripBase64Header = (base64Str: string) => {
  return base64Str.split(',')[1] || base64Str;
};

// Helper to determine mime type
const getMimeType = (base64Str: string) => {
  const match = base64Str.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);
  return match ? match[1] : 'image/jpeg';
};

export const generateAgeImage = async (
  modelName: GeminiModel,
  targetAge: number,
  referenceImages: string[] // Array of Base64 strings
): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key not found in environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // 1. Prepare Reference Images as parts
  const imageParts = referenceImages.map((img) => ({
    inlineData: {
      data: stripBase64Header(img),
      mimeType: getMimeType(img),
    },
  }));

  // 2. Prepare Text Prompt
  // Estimate year based on current year 2024 (approximate)
  const currentYear = new Date().getFullYear();
  // We don't have birth year, but we can guess relative era. 
  // If target age is 10 and reference is 30, we are going back. 
  // For simplicity, we just pass the age to the prompt.
  const prompt = DEFAULT_PROMPT_TEMPLATE.replace('${age}', targetAge.toString()).replace('${year}', 'appropriate for the time period');

  const textPart = { text: prompt };

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: {
        parts: [...imageParts, textPart],
      },
      config: {
        // Image generation config
        // Note: SDK types might be strict, usually image config is inferred or passed in specific config objects
        // For Gemini 2.5/3 Image models, standard generateContent is used.
      }
    });

    // Iterate through parts to find the image
    const parts = response.candidates?.[0]?.content?.parts;
    if (!parts) throw new Error("No content generated");

    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    throw new Error("No image data found in response");
  } catch (error: any) {
    console.error("Gemini Generation Error:", error);
    throw new Error(error.message || "Failed to generate image");
  }
};