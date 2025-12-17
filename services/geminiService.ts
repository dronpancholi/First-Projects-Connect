
import { GoogleGenAI, Type } from "@google/genai";
import { Project, Task, Note, CanvasElement } from '../types.ts';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateProjectPlan = async (projectTitle: string, description: string): Promise<string> => {
  try {
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

export const generateWhiteboardLayout = async (description: string): Promise<CanvasElement[]> => {
  try {
    const prompt = `
      You are the FP-Engine Strategic Architect. Create a high-fidelity, hierarchical mind map for: "${description}".
      
      Requirements:
      1. Structure: Hierarchical tree. Root node at (0, 0).
      2. Depth: Create 3 levels of depth (Core Idea -> Strategic Pillars -> Implementation Details).
      3. Logic: Every child node MUST have a 'parentId' matching its parent's 'id'.
      4. Spatial Reasoning: Nodes should spread out radially or in a logical tree flow to avoid overlapping.
      5. Content: Each node should contain professional, insightful content (minimum 5 words per node).
      6. Density: Generate 12-16 connected nodes.
      
      Colors: 
      - Core: #0F172A (Deep Slate)
      - Strategy: #3B82F6 (Blue)
      - Implementation: #10B981 (Emerald)
      - Risks/Notes: #F59E0B (Amber)
      
      Return ONLY a JSON array of CanvasElement objects: 
      { id: string, parentId?: string, type: 'rect' | 'circle' | 'note', x: number, y: number, content: string, color: string, width: number, height: number }
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
              parentId: { type: Type.STRING },
              type: { type: Type.STRING, enum: ['rect', 'circle', 'note'] },
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
    console.error("FP-Engine Visual Gen Error:", error);
    return [];
  }
};

export const generateImageForWhiteboard = async (prompt: string): Promise<string | null> => {
  try {
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

export const explainCode = async (code: string, language: string): Promise<string> => {
  try {
    const prompt = `You are FP-Engine Code Assistant. Analyze this ${language} code and suggest optimizations:\n\n${code}`;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "FP-Engine: No explanation available.";
  } catch (error) {
    return "FP-Engine: Analysis failed.";
  }
};

export const suggestSubtasks = async (taskTitle: string): Promise<string[]> => {
  try {
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
