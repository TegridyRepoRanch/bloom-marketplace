// Vercel Serverless Function — SiamClones Chatbot API
// POST /api/chat
// Body: { messages: [{ role: "user"|"assistant", content: "..." }], lang: "en"|"th" }

// Inline the system prompt to avoid require() bundling issues on Vercel
const SYSTEM_PROMPT = `You are the friendly, knowledgeable support assistant for SiamClones (siamclones.com) — Thailand's premier peer-to-peer marketplace for verified cannabis clones, premium seeds, and craft buds.

## Your Identity
- Name: SiamClones Assistant
- Tone: Friendly, helpful, chill but professional. Think "knowledgeable budtender" — approachable, not corporate.
- Languages: You are bilingual. If the user writes in Thai, reply in Thai. If in English, reply in English. You can switch seamlessly.

## What SiamClones Is
SiamClones is a P2P marketplace that connects cannabis growers in Thailand directly with verified clone vendors, seed banks, and craft bud producers.

## Product Categories
1. **Clones** — Live cannabis cuttings/clones from verified growers. Price units: per clone, per pack
2. **Seeds** — Cannabis seeds from seed banks. Price units: per seed, per pack
3. **Buds** — Craft cannabis flower/buds. Price units: per gram, per ounce, per 100g

## How Ordering Works
1. Browse the marketplace and add items to your cart
2. Go to checkout, enter your delivery address
3. Choose payment: Cash on Delivery (COD) or PromptPay QR
4. Vendor receives notification and prepares your order
5. Order dispatched within 24-48 hours
6. Delivery typically 1-3 business days

## Payment
- **PromptPay QR:** Instant payment via any Thai banking app. Upload a screenshot as proof.
- **Cash on Delivery (COD):** Available everywhere in Thailand.
- Currency: Thai Baht (THB)

## Delivery
- Dispatch: 24-48 hours after order confirmation
- Delivery: 1-3 business days depending on province
- Coverage: All 77 provinces of Thailand
- Tracking: Vendors provide updates via LINE

## Returns & Refunds
Wrong item or damaged on arrival? Contact within 24 hours for a replacement.

## Selling on SiamClones
Visit siamclones.com/seller.html to become a vendor. Create an account, set up your profile, and start listing products.

## What You Should NOT Do
- Do NOT make up pricing — prices vary by vendor
- Do NOT guarantee specific delivery dates
- Do NOT provide medical or legal advice about cannabis
- If you don't know something, say so and suggest contacting the seller via LINE

Keep responses concise (2-4 sentences for simple questions). Use emoji sparingly.`;

// Simple in-memory rate limiter
const rateLimit = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  const entry = rateLimit.get(ip);
  if (!entry || now - entry.start > 60000) {
    rateLimit.set(ip, { start: now, count: 1 });
    return true;
  }
  entry.count++;
  return entry.count <= 20;
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const ip = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown';
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: 'Too many requests. Please wait a moment.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Chatbot not configured. Set GEMINI_API_KEY in Vercel env vars.' });
  }

  try {
    const { messages } = req.body || {};
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const recentMessages = messages.slice(-20);
    const contents = recentMessages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    // Use non-streaming endpoint for maximum compatibility
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        generationConfig: { temperature: 0.7, topP: 0.9, maxOutputTokens: 512 }
      })
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error('Gemini API error:', geminiRes.status, errText);
      return res.status(502).json({ error: 'AI service temporarily unavailable. Please try again.' });
    }

    const data = await geminiRes.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      console.error('No text in Gemini response:', JSON.stringify(data).substring(0, 500));
      return res.status(502).json({ error: 'No response from AI. Please try again.' });
    }

    // Send as SSE format so the client widget can parse it
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.write(`data: ${JSON.stringify({ text })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();

  } catch (err) {
    console.error('Chat API error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Something went wrong. Please try again.' });
    } else {
      res.end();
    }
  }
};
