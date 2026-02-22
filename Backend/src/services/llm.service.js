/**
 * LLM Abstraction Service — Google Gemini 2.5 Flash Backend
 *
 * Usage:
 *   callLLM({ mode: 'knowledge' | 'performance' | 'json', messages, outputType: 'text' | 'json' })
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable is required');
}

// Initialize the Google Generative AI client once
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Mode → Gemini model configuration map
const MODE_PARAMS = {
    knowledge: { temperature: 0.3, maxOutputTokens: 500 },
    performance: { temperature: 0.3, maxOutputTokens: 500 },
    json: { temperature: 0.1, maxOutputTokens: 300 },
};

// Create model instances
const geminiJsonModel = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 2048,  // Increased to ensure complete JSON responses
    },
});

const geminiTextModel = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1024,
    },
});

/**
 * Primary entry point for LLM calls.
 *
 * @param {Object} opts
 * @param {'knowledge'|'performance'|'json'} opts.mode
 * @param {Array<{role:'system'|'user'|'assistant', content:string}>} opts.messages
 * @param {'text'|'json'} opts.outputType
 * @returns {Promise<string|Object|null>}
 */
export const callLLM = async ({ mode = 'knowledge', messages = [], outputType = 'text' }) => {
    try {
        // Google Generative AI expects: just the text content, no role/parts wrapper
        // For simplicity, we concatenate all messages into a single prompt
        const prompt = messages
            .map(msg => msg.content)
            .join('\n\n');

        let result;
        
        if (outputType === 'json') {
            result = await geminiJsonModel.generateContent(prompt);
        } else {
            result = await geminiTextModel.generateContent(prompt);
        }

        const raw = result.response.text();

        if (!raw) {
            console.warn('[LLM] Empty response from Gemini');
            return null;
        }

        if (outputType === 'json') {
            // Extract JSON from response (may contain markdown wrappers like ```json ... ```)
            // Remove markdown code block wrappers
            let cleanedRaw = raw
                .replace(/^```(?:json)?\s*\n?/m, '')  // Remove opening ```json or ```
                .replace(/\n?```\s*$/m, '')            // Remove closing ```
                .trim();
            
            // Find complete JSON object (handle { } pairs properly)
            let braceCount = 0;
            let inString = false;
            let escapeNext = false;
            let jsonStart = -1;
            
            for (let i = 0; i < cleanedRaw.length; i++) {
                const char = cleanedRaw[i];
                
                if (escapeNext) {
                    escapeNext = false;
                    continue;
                }
                
                if (char === '\\') {
                    escapeNext = true;
                    continue;
                }
                
                if (char === '"') {
                    inString = !inString;
                    continue;
                }
                
                if (!inString) {
                    if (char === '{') {
                        if (braceCount === 0) jsonStart = i;
                        braceCount++;
                    }
                    if (char === '}') {
                        braceCount--;
                        if (braceCount === 0 && jsonStart !== -1) {
                            const jsonStr = cleanedRaw.substring(jsonStart, i + 1);
                            try {
                                return JSON.parse(jsonStr);
                            } catch (parseErr) {
                                console.error('[LLM] JSON parse error:', parseErr.message, 'JSON:', jsonStr.substring(0, 100));
                                return null;
                            }
                        }
                    }
                }
            }
            
            console.warn('[LLM] No complete JSON found in response:', cleanedRaw.substring(0, 150));
            return null;
        }

        // text mode: strip accidental markdown/JSON wrappers
        return raw.trim().replace(/^[`"'{\[]+|[`"'}\]]+$/g, '').trim();
    } catch (err) {
        console.error('[LLM] callLLM error:', err.message);
        return null;
    }
};

export default { callLLM };
