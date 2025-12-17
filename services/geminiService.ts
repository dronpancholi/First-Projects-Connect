
import { GoogleGenAI, Type } from "@google/genai";
import { Project, Task, Note, CanvasElement } from '../types.ts';

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

export const generateWhiteboardLayout = async (description: string): Promise<CanvasElement[]> => {
  try {
    const prompt = `
      Create a logical mind map or architecture diagram for the following concept: "${description}".
      Break it into nodes. Each node should be a CanvasElement.
      Return a JSON array of CanvasElement objects.
      CanvasElement type: { id: string, type: 'note' | 'text' | 'rect' | 'circle', x: number, y: number, content: string, color: string, width: number, height: number }
      
      Rules:
      1. Use logical grouping (center node at 400, 400).
      2. Branches should spread around the center.
      3. Use distinct colors for different categories.
      4. Make the map comprehensive (at least 8 nodes).
      5. Coordinates should be between 0 and 1000.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              type: { type: Type.STRING, enum: ['note', 'text', 'rect', 'circle'] },
              x: { type: Type.NUMBER },
              y: { type: Type.NUMBER },
              content: { type: Type.STRING },
              color: { type: Type.STRING },
              width: { type: Type.NUMBER },
              height: { type: Type.NUMBER }
            },
            required: ['id', 'type', 'x', 'y', 'content', 'color', 'width', 'height']
          }
        }
      }
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Visual Generation Error:", error);
    return [];
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
