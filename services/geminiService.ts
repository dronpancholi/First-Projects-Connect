
import { Project, Task, Note, CanvasElement } from '../types.ts';

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const SITE_URL = "http://localhost:3000"; // Optional: Your site URL for OpenRouter rankings
const SITE_NAME = "First Projects Connect"; // Optional: Your site name

export interface WhiteboardGenerationResponse {
  diagramType: string;
  title: string;
  elements: CanvasElement[];
}

const getApiKey = () => localStorage.getItem('openrouter_key') || process.env.VITE_OPENROUTER_KEY;

const openRouterCall = async (messages: any[], model: string = "google/gemini-2.0-flash-exp:free", jsonMode = false) => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("Missing OpenRouter API Key");

  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "HTTP-Referer": SITE_URL,
      "X-Title": SITE_NAME,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      messages,
      response_format: jsonMode ? { type: "json_object" } : undefined
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenRouter Error: ${err}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
};

export const generateProjectPlan = async (projectTitle: string, description: string): Promise<string> => {
  try {
    const prompt = `You are the FP-Engine, a high-level project architect. Project: "${projectTitle}". Description: "${description}". Generate an actionable Markdown plan.`;
    return await openRouterCall([{ role: "user", content: prompt }]);
  } catch (error) {
    console.error("Plan Gen Error:", error);
    return "FP-Engine: Plan generation error. Please check your OpenRouter Key in Settings.";
  }
};

export const generateWhiteboardLayout = async (description: string): Promise<WhiteboardGenerationResponse> => {
  try {
    const prompt = `Synthesize a diagram for: "${description}". Return valid JSON with this structure: { "diagramType": string, "title": string, "elements": [{ "id": string, "type": "rect"|"circle"|"text"|"connection", "x": number, "y": number, "content": string, "color": string, "width": number, "height": number }] }. Ensure strictly valid JSON.`;

    // Using a more capable model for JSON generation if available, otherwise fallback to free
    const text = await openRouterCall([{ role: "user", content: prompt }], "google/gemini-2.0-flash-exp:free", true);
    return JSON.parse(text);
  } catch (error) {
    console.error("Whiteboard Gen Error:", error);
    return { diagramType: "Error", title: "Error", elements: [] };
  }
};

export const suggestSubtasks = async (taskTitle: string): Promise<string[]> => {
  try {
    const prompt = `Break down "${taskTitle}" into 5 steps. Return a JSON array of strings, e.g., ["step 1", "step 2"].`;
    const text = await openRouterCall([{ role: "user", content: prompt }], "google/gemini-2.0-flash-exp:free", true);
    return JSON.parse(text);
  } catch (error) {
    return [];
  }
};

export const explainCode = async (code: string, language: string): Promise<string> => {
  try {
    const prompt = `Explain the following ${language} code and suggest optimizations:\n\n${code}`;
    return await openRouterCall([{ role: "user", content: prompt }]);
  } catch (error) {
    return "FP-Engine: Error processing code analysis.";
  }
};
