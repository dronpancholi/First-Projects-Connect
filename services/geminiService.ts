
import { GoogleGenAI, Type } from "@google/genai";
import { Project, Task, Note, CanvasElement } from '../types.ts';

export interface WhiteboardGenerationResponse {
  diagramType: string;
  title: string;
  elements: CanvasElement[];
}

const getAi = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateProjectPlan = async (projectTitle: string, description: string): Promise<string> => {
  try {
    const ai = getAi();
    const prompt = `You are the FP-Engine, a high-level project architect. Project: "${projectTitle}". Description: "${description}". Generate an actionable Markdown plan.`;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "FP-Engine: No plan generated.";
  } catch (error) {
    return "FP-Engine: Plan generation error.";
  }
};

export const generateWhiteboardLayout = async (description: string): Promise<WhiteboardGenerationResponse> => {
  try {
    const ai = getAi();
    const prompt = `Synthesize a diagram for: "${description}". Return JSON with elements.`;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            diagramType: { type: Type.STRING },
            title: { type: Type.STRING },
            elements: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  type: { type: Type.STRING },
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
          },
          required: ['diagramType', 'title', 'elements']
        }
      }
    });
    return JSON.parse(response.text || '{"diagramType":"Error","title":"Error","elements":[]}');
  } catch (error) {
    return { diagramType: "Error", title: "Error", elements: [] };
  }
};

export const suggestSubtasks = async (taskTitle: string): Promise<string[]> => {
  try {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Break down "${taskTitle}" into 5 steps. Return JSON array.`,
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  } catch (error) {
    return [];
  }
};

export const explainCode = async (code: string, language: string): Promise<string> => {
  try {
    const ai = getAi();
    const prompt = `Explain the following ${language} code and suggest optimizations if possible:\n\n${code}`;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "FP-Engine: No analysis generated.";
  } catch (error) {
    return "FP-Engine: Error processing code analysis.";
  }
};
