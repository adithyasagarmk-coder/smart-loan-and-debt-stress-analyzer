const { debtHealthScore, loanPriority } = require('../utils/finance');

/* ─────────────────────────────────────────────────────────
   AI CONFIGURATION
   Primary:   Groq  → llama3-8b-8192  (free, fast, solid quality)
   Fallback:  OpenRouter → openai/gpt-4o-mini (fast, cheap)
   No rule-based fallback. If both fail → error message.
───────────────────────────────────────────────────────── */

const GROQ_URL        = 'https://api.groq.com/openai/v1/chat/completions';
const OPENROUTER_URL  = 'https://openrouter.ai/api/v1/chat/completions';

const GROQ_MODEL      = 'llama3-8b-8192';                       // current active Groq model
const OR_MODEL        = 'openai/gpt-4o-mini';                   // current active OpenRouter model

/* ── System prompt with live user financial context ── */
function buildSystemPrompt({ monthlyIncome, monthlyExpenses, totalEMI, stressScore, loans }) {
  const disposable   = monthlyIncome - monthlyExpenses;
  const freeAfterEMI = Math.max(0, disposable - totalEMI);
  const emiPct       = disposable > 0 ? ((totalEMI / disposable) * 100).toFixed(1) : 'N/A';
  const stressLabel  = stressScore >= 70 ? 'Low Stress' : stressScore >= 40 ? 'Moderate' : 'High Stress';

  const loanList = loans.length
    ? loans.map((l, i) => {
        const name = l.loanType || l.type || 'Loan';
        const emi  = l.emi ? `EMI ₹${Number(l.emi).toFixed(0)}` : '';
        return `  ${i + 1}. ${name} — Principal ₹${l.amount} @ ${l.interestRate}% for ${l.tenureMonths || l.duration} months. ${emi}`;
      }).join('\n')
    : '  No active loans on record.';

  return `You are an expert financial advisor embedded in the Smart Loan Analyzer app for Indian users.
Your role is to help users understand their debt health, reduce financial stress, and make smart loan decisions.

LIVE USER FINANCIAL SNAPSHOT:
  Monthly Income:      ₹${monthlyIncome}
  Monthly Expenses:    ₹${monthlyExpenses}
  Disposable Income:   ₹${disposable}
  Total Monthly EMI:   ₹${totalEMI}
  Free Cash (post-EMI):₹${freeAfterEMI}
  EMI / Disposable:    ${emiPct}%
  Stress Score:        ${stressScore}/100 — ${stressLabel}
  Total Active Loans:  ${loans.length}

ACTIVE LOANS:
${loanList}

RESPONSE RULES:
- Be concise: 2–4 sentences for simple questions, up to 6 for complex ones.
- Always reference the user's ACTUAL numbers above — never invent figures.
- Use Indian Rupee symbol ₹ for all currency.
- Give specific, actionable advice (not generic tips).
- Tone: professional, warm, direct. No fluff.
- If asked something unrelated to personal finance, politely decline and redirect.
- Do not use emojis or markdown formatting.`;
}

/* ── Call Groq ── */
async function callGroq(messages) {
  const key = process.env.GROQ_API_KEY;
  if (!key || key.startsWith('your_')) throw new Error('GROQ_API_KEY not configured');

  const res = await fetch(GROQ_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
    body: JSON.stringify({ model: GROQ_MODEL, messages, max_tokens: 400, temperature: 0.35 }),
  });

  if (!res.ok) throw new Error(`Groq ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const reply = data.choices?.[0]?.message?.content?.trim();
  if (!reply) throw new Error('Groq returned empty response');
  return reply;
}

/* ── Call OpenRouter ── */
async function callOpenRouter(messages) {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key || key.startsWith('your_')) throw new Error('OPENROUTER_API_KEY not configured');

  const res = await fetch(OPENROUTER_URL, {
    method:  'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
      'HTTP-Referer': 'http://localhost:5173',
      'X-Title': 'Smart Loan Analyzer',
    },
    body: JSON.stringify({ model: OR_MODEL, messages, max_tokens: 400, temperature: 0.35 }),
  });

  if (!res.ok) throw new Error(`OpenRouter ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const reply = data.choices?.[0]?.message?.content?.trim();
  if (!reply) throw new Error('OpenRouter returned empty response');
  return reply;
}

/* ── Main handler ── */
const chat = async (req, res) => {
  try {
    const {
      monthlyIncome   = 0,
      monthlyExpenses = 0,
      totalEMI        = 0,
      stressScore: passedScore = null,
      loans   = [],
      message = '',
    } = req.body || {};

    if (!message?.trim()) {
      return res.status(400).json({ success: false, message: 'message is required' });
    }

    const safeIncome   = Number(monthlyIncome)  || 0;
    const safeExpenses = Number(monthlyExpenses) || 0;
    const safeEMI      = Number(totalEMI)        || 0;
    const safeLoans    = Array.isArray(loans) ? loans : [];

    if (safeIncome === 0) {
      return res.json({
        success: true,
        data: {
          reply: 'Please set your monthly income and expenses on the Dashboard first so I can give you accurate, personalised advice.',
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Resolve stress score
    let stressScore;
    if (passedScore !== null && Number.isFinite(Number(passedScore))) {
      stressScore = Number(passedScore);
    } else {
      stressScore = debtHealthScore(safeIncome, safeExpenses, safeLoans).score;
    }

    const ctx = {
      monthlyIncome:   safeIncome,
      monthlyExpenses: safeExpenses,
      totalEMI:        safeEMI,
      stressScore,
      loans:           safeLoans,
    };

    const messages = [
      { role: 'system', content: buildSystemPrompt(ctx) },
      { role: 'user',   content: message.trim() },
    ];

    let reply;

    // 1) Try Groq (primary)
    try {
      reply = await callGroq(messages);
      console.log('[AI] Groq responded (mixtral-8x7b)');
    } catch (groqErr) {
      console.warn('[AI] Groq failed:', groqErr.message);

      // 2) Try OpenRouter (fallback)
      try {
        reply = await callOpenRouter(messages);
        console.log('[AI] OpenRouter responded (mistral-7b)');
      } catch (orErr) {
        console.error('[AI] OpenRouter failed:', orErr.message);
        // Both failed — return an honest error, no rule-based fallback
        return res.status(503).json({
          success: false,
          message: 'AI service temporarily unavailable. Please check your API keys in .env or try again shortly.',
        });
      }
    }

    // Sanitize output
    reply = reply
      .replace(/NaN/g, '0')
      .replace(/undefined/g, 'N/A')
      .replace(/Infinity/g, 'very high')
      .trim();

    return res.json({
      success: true,
      data: {
        reply,
        stressScore,
        priority: loanPriority(safeLoans),
        timestamp: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('[AI] Unhandled error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { chat };
