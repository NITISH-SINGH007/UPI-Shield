/**
 * Translation service abstraction.
 *
 * Currently returns pre-written local Hindi translations for safety warnings.
 *
 * API-READY HOOK:
 * Replace `translateSafety` with a call to a translation API
 * (e.g. Google Translate, Gemini, Azure Translator) server-side via:
 *   POST /api/translate { text, targetLang }
 * Never call translation APIs directly from the frontend with API keys.
 */

export interface SafetyCopy {
  title: string;
  body: string;
}

const hindi: Record<string, SafetyCopy> = {
  critical: {
    title: 'गंभीर चेतावनी',
    body: '⚠️ यह संदेश घातक धोखाधड़ी जैसा दिखता है। किसी भी राशि का भुगतान करने से पहले आधिकारिक सेवा प्रदाता के माध्यम से स्वतंत्र रूप से सत्यापित करें। कोई भी OTP, PIN या पासवर्ड साझा न करें।',
  },
  high: {
    title: 'सुरक्षा चेतावनी',
    body: '⚠️ भुगतान करने से पहले आधिकारिक सेवा प्रदाता के माध्यम से संदेश भेजने वाले की स्वतंत्र रूप से पुष्टि करें। अपने OTP, PIN या पासवर्ड किसी के साथ साझा न करें।',
  },
  medium: {
    title: 'सतर्क रहें',
    body: '⚠️ इस संदेश के प्रति सतर्क रहें। किसी भी कदम से पहले संदेश भेजने वाले की आधिकारिक रूप से पुष्टि करें।',
  },
  low: {
    title: 'सामान्य संदेश',
    body: 'यह संदेश सामान्य दिखता है, फिर भी अप्रत्याशित अनुरोधों के प्रति सतर्क रहें और कभी भी OTP या PIN साझा न करें।',
  },
};

const english: Record<string, SafetyCopy> = {
  critical: {
    title: 'Critical Warning',
    body: '⚠️ This message shows strong signs of payment fraud. Do not make the requested payment until you independently verify the sender through the official service provider. Never share OTP, PIN or passwords.',
  },
  high: {
    title: 'Safety Warning',
    body: '⚠️ Do not make the requested payment until you independently verify the sender through the official service provider. Never share your OTP, PIN or passwords.',
  },
  medium: {
    title: 'Stay Cautious',
    body: '⚠️ Be cautious about this message. Verify the sender through official channels before taking any action.',
  },
  low: {
    title: 'Looks Routine',
    body: 'This message appears routine, but stay alert for unexpected requests and never share OTP or PIN.',
  },
};

export function getSafetyCopy(riskLevel: string, lang: 'en' | 'hi'): SafetyCopy {
  const key = riskLevel.toLowerCase();
  const set = lang === 'hi' ? hindi : english;
  return set[key] ?? set.low;
}

export async function translateText(text: string): Promise<string> {
  if (!text) return text;
  
  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, targetLang: 'hi' }),
    });

    if (!response.ok) {
      throw new Error('Translation API failed');
    }

    const data = await response.json();
    return data.translatedText || text;
  } catch (error) {
    console.error('Translation failed:', error);
    return text; // Return original text on failure
  }
}
