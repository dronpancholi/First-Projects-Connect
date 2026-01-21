
import { Project, Task, Note, CanvasElement } from '../types.ts';

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const SITE_URL = "http://localhost:3000"; // Optional: Your site URL for OpenRouter rankings
const SITE_NAME = "First Projects Connect"; // Optional: Your site name

export interface WhiteboardGenerationResponse {
  diagramType: string;
  title: string;
  elements: CanvasElement[];
}

const GOOGLE_API_URL_BASE = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

const getKeys = () => ({
  openRouter: localStorage.getItem('openrouter_key') || import.meta.env.VITE_OPENROUTER_KEY,
  gemini: localStorage.getItem('gemini_key') || import.meta.env.VITE_GEMINI_API_KEY
});

// Helper for Google Direct API
const callGoogleDirect = async (messages: any[], jsonMode: boolean = false): Promise<string> => {
  const { gemini } = getKeys();
  if (!gemini) throw new Error("No Gemini Key");

  // Convert OpenAI messages to Gemini contents
  const contents = messages.map(m => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.content }]
  }));

  // Add system prompt to the first user message if present (Gemini REST doesn't strictly have system role in simple endpoint, or it's separate)
  // Simple workaround: prepend system prompt to first user message

  const response = await fetch(`${GOOGLE_API_URL_BASE}?key=${gemini}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents,
      generationConfig: {
        response_mime_type: jsonMode ? "application/json" : "text/plain"
      }
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini Direct Error: ${err}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
};

const callOpenRouter = async (messages: any[], model: string, jsonMode: boolean = false): Promise<string> => {
  const { openRouter } = getKeys();
  if (!openRouter) throw new Error("No OpenRouter Key");

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openRouter}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': SITE_URL,
      'X-Title': SITE_NAME
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
  return data.choices?.[0]?.message?.content || "";
};

// Unified Caller - Tries Google first (Free/Direct), then OpenRouter
const callAI = async (messages: any[], modelFallback: string = "google/gemini-2.0-flash-exp:free", jsonMode: boolean = false): Promise<string> => {
  try {
    // Priority 1: Google Direct
    // Only works if we have a key. 
    // Note: Google Direct currently supports Gemini 1.5 Flash well.
    return await callGoogleDirect(messages, jsonMode);
  } catch (e) {
    console.warn("Google Direct failed, falling back to OpenRouter", e);
    try {
      return await callOpenRouter(messages, modelFallback, jsonMode);
    } catch (e2) {
      console.error("All AI providers failed", e2);
      throw new Error("AI Service Unavailable. Check API Keys.");
    }
  }
};

export const generateProjectPlan = async (title: string, description: string): Promise<string> => {
  try {
    const prompt = `
      Act as "FP-Engine", an expert project architect.
      Project: "${title}"
      Description: "${description}"
      
      Output a detailed project plan in Markdown format.
      Include:
      1. Executive Summary
      2. Key Milestones (Bulleted)
      3. Technical Stack Recommendations
      4. Risk Assessment
    `;
    return await callAI([{ role: "user", content: prompt }], "google/gemini-2.0-flash-exp:free", false);
  } catch (error) {
    return "Failed to generate plan. Please check API settings.";
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
    const prompt = `Break down the task "${taskTitle}" into 5 smaller, actionable subtasks. Return ONLY a JSON array of strings. Example: ["Step 1", "Step 2"]`;
    const text = await callAI([{ role: "user", content: prompt }], "google/gemini-2.0-flash-exp:free", true);
    return JSON.parse(text);
  } catch (error) {
    return ["Analyze requirements", "Draft initial version", "Review", "Test", "Finalize"];
  }
};

export interface CommandAction {
  type: 'NAVIGATE' | 'CREATE_TASK' | 'CREATE_PROJECT' | 'CREATE_NOTE' | 'UNKNOWN';
  payload: any;
  feedback: string;
}

export const interpretCommand = async (command: string): Promise<CommandAction> => {
  try {
    const prompt = `
      You are "FP-Engine", the central AI intelligence for "First Projects Connect". 
      User Command: "${command}".
      
      Available Actions (respond in STRICT JSON only, no markdown):
      1. NAVIGATE: { type: "NAVIGATE", payload: { path: "/projects" | "/kanban" | "/settings" | "/" }, feedback: "FP-Engine: Navigating..." }
      2. CREATE_TASK: { type: "CREATE_TASK", payload: { title: string, priority: "High"|"Medium"|"Low" }, feedback: "FP-Engine: Creating task..." }
      3. CREATE_PROJECT: { type: "CREATE_PROJECT", payload: { title: string, description: string }, feedback: "FP-Engine: Initializing project..." }
      4. CREATE_NOTE: { type: "CREATE_NOTE", payload: { title: string, content: string }, feedback: "FP-Engine: Logging note..." }
      
      If unclear, return { type: "UNKNOWN", payload: {}, feedback: "FP-Engine: Command unclear. Try 'Create task...' or 'Go to...'" }
    `;
    const text = await callAI([{ role: "user", content: prompt }], "google/gemini-2.0-flash-exp:free", true);
    return JSON.parse(text);
  } catch (error) {
    console.error("Command Interp Error:", error);
    return { type: 'UNKNOWN', payload: {}, feedback: "FP-Engine: Connection Failure." };
  }
};

export const explainCode = async (code: string, language: string): Promise<string> => {
  try {
    const prompt = `Act as FP-Engine. Explain the following ${language} code and suggest optimizations:\n\n${code}`;
    return await callAI([{ role: "user", content: prompt }], "google/gemini-2.0-flash-exp:free", false);
  } catch (error) {
    return "FP-Engine: Explanation failed.";
  }
};

export const generateDailyBriefing = async (stats: { tasks: number, projects: number, highPriority: number }): Promise<string> => {
  try {
    const prompt = `
      Act as FP-Engine, a strategic AI partner.
      Data: 
      - Pending Tasks: ${stats.tasks}
      - Active Projects: ${stats.projects}
      - High Priority Items: ${stats.highPriority}
      
      Generate a concise, 3-sentence "Morning Briefing" in Markdown. 
      Be professional yet futuristic. Focus on what needs attention.
    `;
    return await callAI([{ role: "user", content: prompt }], "google/gemini-2.0-flash-exp:free", false);
  } catch (error) {
    return "FP-Engine is offline.";
  }
};

export const generateIdeas = async (existingIdeas: string[]): Promise<string[]> => {
  try {
    const prompt = `
      Act as FP-Engine.
      Existing Ideas: ${JSON.stringify(existingIdeas)}
      
      Generate 3 NEW, innovative, divergent ideas related to the above.
      Return ONLY a JSON array of strings.
    `;
    const text = await callAI([{ role: "user", content: prompt }], "google/gemini-2.0-flash-exp:free", true);
    return JSON.parse(text);
  } catch (error) {
    return ["AI Brainstorming Error"];
  }
};
