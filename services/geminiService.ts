
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getDeliveryEstimate = async (details: {
  product: string;
  dimensions: string;
  weight: string;
  distance: string;
}) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Determine the best delivery category (Express, Standard, or Heavy) and a suggested price in BRL (R$) for a P2P delivery with these details: 
      Product: ${details.product}
      Dimensions: ${details.dimensions}
      Weight: ${details.weight}
      Distance: ${details.distance}.
      Provide the result in JSON format.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            estimatedPrice: { type: Type.NUMBER },
            reasoning: { type: Type.STRING },
            riskLevel: { type: Type.STRING, description: "Low, Medium, or High based on item description" }
          },
          required: ["category", "estimatedPrice", "reasoning", "riskLevel"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Estimate Error:", error);
    return { category: "Standard", estimatedPrice: 25.00, reasoning: "Fallback estimate", riskLevel: "Low" };
  }
};

export const getSmartSupport = async (query: string) => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: query,
      config: {
        systemInstruction: "You are a helpful assistant for LevaAí, a P2P delivery platform in Brazil. Answer questions about how the app works, safety, and delivery tips."
      }
    });
    return response.text;
};
