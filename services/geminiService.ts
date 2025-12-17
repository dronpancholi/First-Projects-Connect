
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Project, Task, Note } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateProjectPlan = async (projectTitle: string, description: string): Promise<string> => {
  try {
    const prompt = `
      You are an expert project manager acting as a productivity assistant.
      Project: "${projectTitle}"
      Description: "${description}"
      Generate an actionable Markdown plan with Summary, Tasks, and Risks.
    `;
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
    });
    return response.text || "Could not generate plan.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating plan.";
  }
};

export const generateImageForWhiteboard = async (prompt: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: [{ text: `Generate a minimalist icon or illustration for: ${prompt}. Clean white background.` }],
      config: {
        imageConfig: { aspectRatio: "1:1" }
      }
    });
    
    const imagePart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    if (imagePart?.inlineData) {
      return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
    }
    return null;
  } catch (error) {
    console.error("Image Gen Error:", error);
    return null;
  }
};

export const explainCode = async (code: string, language: string): Promise<string> => {
  try {
    const prompt = `Explain this ${language} code clearly and suggest 2 improvements:\n\n${code}`;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "No explanation available.";
  } catch (error) {
    return "AI explanation failed.";
  }
};

export const suggestSubtasks = async (taskTitle: string): Promise<string[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Break down the task "${taskTitle}" into 3-5 actionable sub-steps. Return ONLY a JSON array of strings.`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "[]");
  } catch (error) {
    return [];
  }
};
