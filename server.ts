import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const PORT = 3000;
const FALLBACK_MODELS = [
  'gemini-3.6-flash',
  'gemini-3.1-flash-lite',
  'gemini-flash-latest',
  'gemini-3.7-flash',
];

// Lazy-initialized Gemini AI client
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not set in environment. AI generation calls will fail.');
    }
    aiClient = new GoogleGenAI({ apiKey: apiKey || '' });
  }
  return aiClient;
}

/**
 * Resilient Model Fallback Helper
 * Sequentially attempts the fallback ladder on recoverable errors.
 */
async function generateWithFallback(params: {
  contents: any;
  systemInstruction?: string;
  responseMimeType?: string;
  responseSchema?: any;
}) {
  const ai = getAI();
  let lastError: any = null;

  for (const modelName of FALLBACK_MODELS) {
    try {
      const config: any = {};
      if (params.systemInstruction) {
        config.systemInstruction = params.systemInstruction;
      }
      if (params.responseMimeType) {
        config.responseMimeType = params.responseMimeType;
      }
      if (params.responseSchema) {
        config.responseSchema = params.responseSchema;
      }

      const response = await ai.models.generateContent({
        model: modelName,
        contents: params.contents,
        config: Object.keys(config).length > 0 ? config : undefined,
      });

      return {
        text: response.text || '',
        modelUsed: modelName,
      };
    } catch (err: any) {
      console.warn(`Attempt with model '${modelName}' failed:`, err?.message || err);
      lastError = err;
      // Recoverable error check: 503, 429, 404, 500, or model-not-found
      const status = err?.status || err?.statusCode || 0;
      const isRecoverable =
        status === 429 ||
        status === 503 ||
        status === 500 ||
        status === 404 ||
        err?.message?.includes('not found') ||
        err?.message?.includes('overloaded') ||
        err?.message?.includes('ResourceExhausted');

      if (!isRecoverable) {
        // If not recoverable (e.g. invalid auth), break or continue
        console.warn(`Non-standard error code: ${status}, trying next fallback`);
      }
    }
  }

  throw lastError || new Error('All AI models in fallback ladder failed.');
}

async function startServer() {
  const app = express();

  // 1. Top-Level Payload Parsers (MANDATORY BEFORE ANY ROUTE)
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // 2. Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: Date.now() });
  });

  // 3. Multi-turn AI Chat Endpoint
  app.post('/api/gemini/chat', async (req, res) => {
    try {
      const body = req.body && typeof req.body === 'object' ? req.body : {};
      const { message, history = [], entryContext = {}, mode = 'reflective' } = body;

      if (!message || typeof message !== 'string') {
        res.status(400).json({ error: 'Message text is required.' });
        return;
      }

      // Build structured prompt with context
      const systemInstruction = `You are ReflectAI, an empathetic, insightful, and thought-provoking AI reflection partner and journaling companion.
Your goal is to help the user unpack their thoughts, identify cognitive patterns, ask clarifying questions, and brainstorm constructively.

Guidelines:
1. Tone: Warm, grounded, analytical yet deeply empathetic.
2. Structure: Keep responses concise (2-4 paragraphs or formatted bullet points), easy to read, and highlight actionable wisdom.
3. Formatting: Use Markdown for formatting (bolding key concepts, lists).
4. Mode behavior:
   - "reflective": Ask 1 or 2 powerful open-ended questions to deepen self-awareness.
   - "brainstorm": Offer 3-5 structured, creative possibilities and perspectives.
   - "actionable": Help translate rambling thoughts into concrete next steps.
   - "summary": Distill core emotions and themes crisply.

Entry Context:
- Title: ${entryContext.title || 'Untitled Entry'}
- Category: ${entryContext.category || 'General'}
- Mood: ${entryContext.mood || 'Not specified'}
- Current Entry Content:
"""
${(entryContext.content || '').slice(0, 4000)}
"""`;

      // Build conversation contents
      const formattedContents: any[] = [];

      // Add prior turns
      if (Array.isArray(history)) {
        for (const item of history) {
          if (item && item.text) {
            formattedContents.push({
              role: item.role === 'model' ? 'model' : 'user',
              parts: [{ text: item.text }],
            });
          }
        }
      }

      // Add current user prompt
      formattedContents.push({
        role: 'user',
        parts: [{ text: message }],
      });

      const result = await generateWithFallback({
        systemInstruction,
        contents: formattedContents,
      });

      res.json({
        success: true,
        text: result.text,
        modelUsed: result.modelUsed,
      });
    } catch (error: any) {
      console.error('Error in /api/gemini/chat:', error);
      res.status(500).json({
        error: error?.message || 'Failed to generate AI response. Please try again.',
      });
    }
  });

  // 4. Entry Analysis & Synthesis Endpoint
  app.post('/api/gemini/analyze', async (req, res) => {
    try {
      const body = req.body && typeof req.body === 'object' ? req.body : {};
      const { title = '', content = '', category = 'personal', mood } = body;

      if (!content || typeof content !== 'string' || content.trim().length === 0) {
        res.status(400).json({ error: 'Journal entry content is required to generate analysis.' });
        return;
      }

      const prompt = `Analyze the following personal journal entry.
Provide:
1. A concise 2-3 sentence executive summary capturing the core situation and sentiment.
2. 3 key reflective insights or cognitive patterns observed.
3. 2-3 practical, constructive action items or journaling inquiry questions.
4. 2-4 recommended relevant tags (lowercase, hyphenated).
5. The most accurate detected mood from: ["calm", "energized", "reflective", "thoughtful", "anxious", "inspired", "focused", "grateful"].

Entry Details:
Title: ${title}
Category: ${category}
User Specified Mood: ${mood || 'None'}
Content:
"""
${content.slice(0, 6000)}
"""

Format your response strictly as valid JSON matching this schema:
{
  "summary": "string",
  "insights": ["string", "string", "string"],
  "actionItems": ["string", "string"],
  "suggestedTags": ["string", "string"],
  "detectedMood": "calm" | "energized" | "reflective" | "thoughtful" | "anxious" | "inspired" | "focused" | "grateful"
}`;

      const result = await generateWithFallback({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        responseMimeType: 'application/json',
      });

      let parsed: any = {};
      try {
        parsed = JSON.parse(result.text);
      } catch (jsonErr) {
        // Fallback cleanup if response has markdown wrappers
        const cleaned = result.text.replace(/```json/g, '').replace(/```/g, '').trim();
        parsed = JSON.parse(cleaned);
      }

      res.json({
        success: true,
        summary: parsed.summary || 'Summary unavailable',
        insights: Array.isArray(parsed.insights) ? parsed.insights : [],
        actionItems: Array.isArray(parsed.actionItems) ? parsed.actionItems : [],
        suggestedTags: Array.isArray(parsed.suggestedTags) ? parsed.suggestedTags : [],
        detectedMood: parsed.detectedMood || mood || 'reflective',
        modelUsed: result.modelUsed,
      });
    } catch (error: any) {
      console.error('Error in /api/gemini/analyze:', error);
      res.status(500).json({
        error: error?.message || 'Failed to analyze entry. Please try again.',
      });
    }
  });

  // 5. Vite dev middleware vs Production Static Serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
