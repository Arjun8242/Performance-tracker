/**
 * LLM Abstraction Service — Google Gemini 2.5 Flash Backend
 *
 * Usage:
 *   callLLM({ mode: 'knowledge' | 'performance' | 'json', messages, outputType: 'text' | 'json' })
 */

import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("[LLM] GEMINI_API_KEY missing — AI features disabled");
}

// Proper initialization for @google/genai
const genAI = GEMINI_API_KEY
  ? new GoogleGenAI({ apiKey: GEMINI_API_KEY })
  : null;

// Safety configuration
const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
];

const LLM_TIMEOUT_MS = 15000;
const DEFAULT_MODEL = "gemini-2.5-flash";

/**
 * Timeout wrapper
 */
const withTimeout = (promiseFn, ms, abortController) => {
  let timeoutId;

  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      abortController?.abort();
      reject(new Error(`LLM request timed out after ${ms}ms`));
    }, ms);
  });

  return Promise.race([promiseFn(), timeoutPromise]).finally(() =>
    clearTimeout(timeoutId)
  );
};


/**
 * Extract JSON safely from model output
 */
const extractJSON = (raw) => {
  const cleaned = raw
    .replace(/^```(?:json)?\s*\n?/m, "")
    .replace(/\n?```\s*$/m, "")
    .trim();

  let braceCount = 0;
  let inString = false;
  let escapeNext = false;
  let jsonStart = -1;

  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i];

    if (escapeNext) {
      escapeNext = false;
      continue;
    }

    if (char === "\\") {
      escapeNext = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (!inString) {
      if (char === "{") {
        if (braceCount === 0) jsonStart = i;
        braceCount++;
      }

      if (char === "}") {
        braceCount--;
        if (braceCount === 0 && jsonStart !== -1) {
          const jsonStr = cleaned.substring(jsonStart, i + 1);
          return JSON.parse(jsonStr);
        }
      }
    }
  }

  throw new Error("No valid JSON object found in model response");
};

/**
 * Main LLM entry point
 */
export const callLLM = async ({
  mode = "knowledge",
  messages = [],
  outputType = "text",
}) => {
  if (!genAI) {
    console.warn("[LLM] Gemini client not initialized");
    return null;
  }

  try {
    const prompt = messages.map((m) => m.content).join("\n\n");

    const generationConfig =
      outputType === "json"
        ? { temperature: 0.1, maxOutputTokens: 2048 }
        : { temperature: 0.3, maxOutputTokens: 1024 };

    const response = await withTimeout(
      genAI.models.generateContent({
        model: DEFAULT_MODEL,
        contents: prompt,
        generationConfig,
        safetySettings,
      }),
      LLM_TIMEOUT_MS
    );

    const raw = response?.text;

    if (!raw) {
      console.warn("[LLM] Empty response from Gemini");
      return null;
    }

    if (outputType === "json") {
      try {
        return extractJSON(raw);
      } catch (err) {
        console.error("[LLM] JSON parse error:", err.message);
        return null;
      }
    }

    return raw.trim();
  } catch (err) {
    console.error("[LLM] callLLM error:", err.message);
    return null;
  }
};

export default { callLLM };