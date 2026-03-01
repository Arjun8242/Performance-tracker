import {GoogleGenAI} from '@google/genai'

const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY);

const models = await genAI.listModels();
console.log(models);