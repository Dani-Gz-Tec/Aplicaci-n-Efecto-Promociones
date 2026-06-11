import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes FIRST
  app.post('/api/summary', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY environment variable is missing.');
      }
      
      const ai = new GoogleGenAI({ apiKey });
      const { dataSummary } = req.body;
      
      const prompt = `
Como un consultor senior de business intelligence y experto en retail analytics, analiza los siguientes datos de promociones comerciales y genera un resumen ejecutivo.

El formato debe incluir:
1. Resumen Ejecutivo (1 párrafo)
2. Insights Accionables (Viñetas cortas)
3. Anomalías y Riesgos
4. Recomendaciones Estratégicas

Usa un tono profesional, claro, estilo "SaaS Enterprise". No uses más de 300 palabras en total. Resalta los insights sobre caídas de precios vs incrementos de volúmen (elasticidad).

Dato a analizar:
${dataSummary}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
           temperature: 0.2, // Low temperature for more analytical answers
        }
      });

      res.json({ text: response.text });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to generate summary' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
