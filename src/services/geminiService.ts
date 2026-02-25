import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface AnalysisResult {
  diseaseName: string;
  confidence: string;
  symptoms: string[];
  treatment: string;
  fertilizerRecommendation: string;
  preventionTips: string[];
}

export async function analyzeCropImage(base64Image: string): Promise<AnalysisResult> {
  const model = "gemini-3-flash-preview";
  
  const prompt = `Analyze this crop image for diseases. 
  Provide a detailed report including the disease name (or "Healthy" if no disease is found), 
  confidence level, symptoms observed, recommended treatment, fertilizer recommendations to boost health, 
  and prevention tips.
  
  Return the result in JSON format.`;

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Image.split(",")[1] || base64Image,
          },
        },
        { text: prompt },
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          diseaseName: { type: Type.STRING },
          confidence: { type: Type.STRING },
          symptoms: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          treatment: { type: Type.STRING },
          fertilizerRecommendation: { type: Type.STRING },
          preventionTips: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["diseaseName", "confidence", "symptoms", "treatment", "fertilizerRecommendation", "preventionTips"]
      }
    }
  });

  try {
    return JSON.parse(response.text || "{}") as AnalysisResult;
  } catch (error) {
    console.error("Failed to parse Gemini response:", error);
    throw new Error("Failed to analyze image. Please try again.");
  }
}
