import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for AI Analysis
  app.post('/api/analyze', async (req, res) => {
    try {
      const { prompt, context, geminiApiKey } = req.body;
      const apiKey = geminiApiKey || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({ error: 'Missing API key. Configure it in Settings.' });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `You are an AI trading analyst system. Analyze the following market context and answer the user's prompt. 
If the user is asking for analysis on a specific asset or a trading signal, you MUST reply in the following EXACT Markdown format, replacing the bracketed values with your calculated data:

[Asset Symbol]

Recommendation:
[BUY / SELL / HOLD]

Confidence:
[e.g., 89%]

Probability of upward movement:
[e.g., 81%]

Current Price:
[$ Value]

Target:
[$ Value]

Stop Loss:
[$ Value]

Risk/Reward:
[Value]

Trend:
[Bullish / Bearish / Neutral]

Indicators

[Indicator 1 Name] ✔
[Indicator 2 Name] ✔
[Indicator 3 Name] ✖
[Indicator 4 Name] ✔
[Indicator 5 Name] ✔

Suggested Allocation

[Value]% of available capital

Reason

[1-2 sentences explaining the reasoning, referencing the indicators and market context.]

AI Confidence Engine

XGBoost      [BUY/SELL]   [XX]%
LightGBM     [BUY/SELL]   [XX]%
RandomForest [BUY/SELL]   [XX]%
Average      [XX]%

If the user is NOT asking for an asset analysis (e.g. asking a general question), just answer succinctly and professionally in a direct tone.

Context:
${context}

User prompt:
${prompt}`,
      });

      res.json({ result: response.text });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: err.message });
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
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
