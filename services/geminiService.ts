
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
    const prompt = `
      You are the FP-Engine, a high-level project architect.
      Project: "${projectTitle}"
      Description: "${description}"
      Generate an actionable, execution-ready Markdown plan with Strategy Summary, Phased Tasks, and Risk Mitigation.
    `;
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
    });
    return response.text || "FP-Engine: Could not generate plan.";
  } catch (error) {
    console.error("FP-Engine API Error:", error);
    return "FP-Engine: Error generating plan.";
  }
};

export const generateWhiteboardLayout = async (description: string): Promise<WhiteboardGenerationResponse> => {
  try {
    const ai = getAi();
    const prompt = `
      You are the FP-Engine Strategic Visual Architect. Your goal is to translate complex ideas into professional, executive-level visual architectures.
      
      User Goal: "${description}"
      
      Your Task:
      1. Determine the best visual format for this request. Options: 
         - 'Flowchart' (Use for processes, sequences, decisions)
         - 'Mind Map' (Use for brainstorming, branching ideas)
         - 'SWOT Analysis' (Use for strategic evaluation)
         - 'System Architecture' (Use for technical diagrams)
         
      2. Construct the architecture:
         - Nodes must be logically connected via 'parentId'.
         - Use 'rect' for steps/tasks, 'circle' for start/milestones, 'diamond' for decisions, 'note' for insights.
         - Ensure professional spacing (nodes should not overlap).
         - Each node needs insightful, specific content.
         
      Colors:
      - Primary/Core: #1E293B (Deep Slate)
      - Process/Action: #2563EB (Blue)
      - Milestone/Success: #059669 (Emerald)
      - Decision/Warning: #D97706 (Amber)
      - Backgrounds: Use lighter versions (#EFF6FF, #ECFDF5) for node colors.
      
      Return ONLY a JSON object: 
      { 
        "diagramType": string, 
        "title": string, 
        "elements": [
          { "id": string, "parentId": string, "type": string, "x": number, "y": number, "content": string, "color": string, "width": number, "height": number }
        ]
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
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
                  parentId: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ['rect', 'circle', 'note', 'diamond', 'triangle'] },
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
    console.error("FP-Engine Visual Gen Error:", error);
    return { diagramType: "Error", title: "Error", elements: [] };
  }
};

export const generateImageForWhiteboard = async (prompt: string): Promise<string | null> => {
  try {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: [{ text: `Generate a minimalist icon for FP-Engine: ${prompt}. Clean professional design on white background.` }],
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
    console.error("FP-Engine Image Gen Error:", error);
    return null;
  }
};

export const suggestSubtasks = async (taskTitle: string): Promise<string[]> => {
  try {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are FP-Engine. Break down "${taskTitle}" into 5 technical, actionable sub-steps. Return ONLY a JSON array of strings.`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "[]");
  } catch (error) {
    return [];
  }
};

// Add explainCode to provide AI insights for the Code Studio feature
export const explainCode = async (code: string, language: string): Promise<string> => {
  try {
    const ai = getAi();
    const prompt = `Analyze this ${language} code as the FP-Engine logic architect. Provide a concise technical explanation and suggest specific optimizations for performance and readability.
    
    Code:
    ${code}`;
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
    });
    return response.text || "FP-Engine: No analysis available for this code block.";
  } catch (error) {
    console.error("FP-Engine Code Analysis Error:", error);
    return "FP-Engine: Error analyzing code.";
  }
};
