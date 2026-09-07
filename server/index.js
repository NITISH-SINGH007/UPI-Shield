import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { HfInference } from '@huggingface/inference';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// Initialize clients
let ai = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

let hf = null;
if (process.env.HF_TOKEN) {
  hf = new HfInference(process.env.HF_TOKEN);
}

// Fallback contextual logic when AI fails
import { analyzeMessage as fallbackAnalyze } from '../src/services/analyzeMessage.ts'; // We'll need to adapt the mock to work here or just duplicate simple logic, but for simplicity we will just return a placeholder if both fail, or we can use dynamic import. Actually, let's keep it simple.

const systemPrompt = `You are an expert scam and fraud detection AI for a system called UPI-Shield. 
Analyze the following message for coercion, urgency, threats, payment requests, credential requests, and suspicious links.
Return your analysis STRICTLY as a JSON object matching this schema:
{
  "riskScore": 0, // Number 0-100
  "riskLevel": "LOW | MEDIUM | HIGH | CRITICAL",
  "summary": "Brief 1-2 sentence plain-english summary of the risk",
  "signals": [
    {
      "category": "urgency | threat | authority | payment | credential | reward | verification | coercion | upi",
      "severity": "low | medium | high | critical",
      "explanation": "Why this signal was flagged"
    }
  ],
  "contextualReasoning": "Detailed explanation of why this was flagged based on combination of signals",
  "recommendedActions": ["Action 1", "Action 2"],
  "upiDetected": boolean,
  "upiId": "vpa string if detected or null",
  "credentialRequest": boolean,
  "urgencyDetected": boolean,
  "authorityClaimDetected": boolean,
  "paymentRequestDetected": boolean
}`;

app.post('/api/analyze', async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    let result = null;

    // Try Gemini First
    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: [{ role: 'user', parts: [{ text: `Analyze this message: "${message}"` }] }],
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: 'application/json',
          },
        });
        
        result = JSON.parse(response.text);
      } catch (geminiError) {
        console.error('Gemini Error:', geminiError);
        // Fallback to HF
      }
    }

    if (result) {
       return res.json(result);
    }

    // Try HuggingFace Second (Zero-shot text classification as fallback)
    if (hf) {
       try {
          const hfRes = await hf.zeroShotClassification({
            model: 'facebook/bart-large-mnli',
            inputs: message,
            parameters: {
              candidate_labels: ['scam', 'legitimate', 'coercion', 'urgency', 'payment fraud', 'phishing'],
            }
          });
          
          // Construct a basic JSON response from HF labels
          const topLabel = hfRes[0].labels[0];
          const topScore = hfRes[0].scores[0];
          
          let riskScore = 0;
          let riskLevel = 'LOW';
          if (['scam', 'coercion', 'payment fraud', 'phishing'].includes(topLabel)) {
             riskScore = Math.round(topScore * 100);
             riskLevel = riskScore > 80 ? 'CRITICAL' : riskScore > 60 ? 'HIGH' : 'MEDIUM';
          }

          result = {
            riskScore,
            riskLevel,
            summary: `Analyzed using Hugging Face fallback. Top detected signal: ${topLabel}`,
            signals: [
              {
                 category: topLabel,
                 severity: riskLevel.toLowerCase(),
                 explanation: `Hugging Face zero-shot classification identified this as ${topLabel} with ${Math.round(topScore * 100)}% confidence.`
              }
            ],
            contextualReasoning: "Fallback analysis performed using Hugging Face text classification due to primary AI unavailability.",
            recommendedActions: riskScore > 50 ? ["Exercise caution", "Do not click links"] : ["Appears safe, but remain vigilant"],
            upiDetected: /upi:\/\/pay/i.test(message),
            upiId: null,
            credentialRequest: /otp|pin|password/i.test(message),
            urgencyDetected: /urgent|immediately|today/i.test(message),
            authorityClaimDetected: false,
            paymentRequestDetected: /pay|₹|rs/i.test(message)
          };
          return res.json(result);
       } catch (hfError) {
          console.error('Hugging Face Error:', hfError);
       }
    }

    // Both failed or keys missing - return 503 so frontend uses local mock
    return res.status(503).json({ error: 'AI Services Unavailable' });

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/translate', async (req, res) => {
    const { text, targetLang = 'hi' } = req.body;
    if (!text) {
        return res.status(400).json({ error: 'Text is required' });
    }

    try {
        if (ai) {
             const response = await ai.models.generateContent({
                model: 'gemini-3.6-flash',
                contents: [{ role: 'user', parts: [{ text: `Translate the following text to Hindi (make it sound natural for an Indian user, not awkward literal translation): "${text}"` }] }],
                config: {
                    systemInstruction: "You are a professional translator. Respond ONLY with the translated text and nothing else."
                }
             });
             return res.json({ translatedText: response.text.trim() });
        }
        return res.status(503).json({ error: 'Translation AI Unavailable' });
    } catch (e) {
        console.error('Translate Error:', e);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(PORT, () => {
  console.log(`UPI-Shield Backend running on http://localhost:${PORT}`);
});
