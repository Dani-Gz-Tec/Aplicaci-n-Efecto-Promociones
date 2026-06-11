import { GoogleGenAI } from '@google/genai';

// Initialize the Gemini client.
// The API key is securely injected by AI Studio.
let aiClient: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is missing.');
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

export async function generateExecutiveSummary(dataSummary: string): Promise<string> {
  try {
    const response = await fetch('/api/summary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ dataSummary }),
    });

    if (!response.ok) {
        throw new Error('Failed to generate summary');
    }

    const json = await response.json();
    return json.text || "No se puro generar el insight.";
  } catch (error) {
    console.error('Error generating AI insights:', error);
    return "Error al conectar con la IA para generar insights. Asegúrese de que la API Key de Gemini esté configurada.";
  }
}
