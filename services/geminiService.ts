import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Project, Task, Note } from '../types';

// Initialize the client. 
// Note: This requires process.env.API_KEY to be set in the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const modelId = 'gemini-2.5-flash';

export const generateProjectPlan = async (projectTitle: string, description: string): Promise<string> => {
  try {
    const prompt = `
      You are an expert project manager acting as a productivity assistant.
      
      I have a project titled "${projectTitle}".
      Description: "${description}"

      Please generate a concise, actionable Markdown plan.
      Include:
      1. A brief executive summary.
      2. A list of 3-5 suggested initial tasks (bullet points).
      3. A list of potential risks or considerations.

      Keep the tone professional, minimal, and direct.
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
    });

    return response.text || "Could not generate plan.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating plan. Please check your API key.";
  }
};

export const summarizeNotes = async (notes: Note[]): Promise<string> => {
  if (notes.length === 0) return "No notes to summarize.";

  const notesText = notes.map(n => `- ${n.title}: ${n.content}`).join('\n');
  
  try {
    const prompt = `
      Summarize the following notes into a single cohesive paragraph highlighting the main themes and any action items.
      
      Notes:
      ${notesText}
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
    });

    return response.text || "Could not summarize notes.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating summary.";
  }
};

export const suggestTasksFromIdea = async (ideaContent: string): Promise<string[]> => {
  try {
    const prompt = `
      Extract 3-5 actionable tasks from the following idea text. Return ONLY a JSON array of strings, nothing else.
      
      Idea: "${ideaContent}"
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (!text) return [];
    
    return JSON.parse(text) as string[];
  } catch (error) {
    console.error("Gemini API Error:", error);
    return [];
  }
};

export const suggestSubtasks = async (taskTitle: string): Promise<string[]> => {
  try {
    const prompt = `
      Break down the task "${taskTitle}" into 3-5 smaller, actionable sub-steps.
      Return ONLY a JSON array of strings.
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text) as string[];
  } catch (error) {
    console.error("Gemini API Error:", error);
    return [];
  }
};
