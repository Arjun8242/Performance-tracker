import httpStatus from 'http-status';
import { callLLM } from '../services/llm.service.js';
import aiContextService from '../services/aiContext.service.js';
import WorkoutPlan from '../models/workoutPlan.model.js';
import Exercise from '../models/Exercise.model.js';
import ChatSession from '../models/chatSession.model.js';
import User from '../models/user.model.js';
import ApiError from '../utils/ApiError.js';

// ─── Constants ───────────────────────────────────────────────────────────────

const VALID_MODIFICATION_TYPES = ['increase_volume', 'reduce_volume', 'add_exercise', 'remove_exercise'];
const VALID_MUSCLES = ['chest', 'back', 'legs', 'shoulders', 'biceps', 'triceps', 'core'];
const VALID_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MAX_HISTORY_MESSAGES = 10;  // 5 turns
const SESSION_HISTORY_CAP = 20;   // rolling storage ceiling

// ─── Intent Classification ────────────────────────────────────────────────────

/**
 * Classify incoming chat message into routing modes.
 * Returns: 'direct' | 'knowledge' | 'performance'
 */
const classifyIntent = (message) => {
    const m = message.toLowerCase();

    // MODE A — Direct DB (no LLM)
    if (
        /\bstreak\b/.test(m) ||
        /\bcompletion\b/.test(m) ||
        /\bweekly rate\b/.test(m) ||
        /\bweak muscle\b/.test(m) ||
        /\bmuscle imbalance\b/.test(m)
    ) return 'direct';

    // MODE C — Performance
    if (
        /\bplateau\b/.test(m) ||
        /\bprogress\b/.test(m) ||
        /\bfatigue\b/.test(m) ||
        /\bimbalance\b/.test(m) ||
        /\bvolume\b/.test(m) ||
        /\boptimize\b/.test(m) ||
        /\boptimization\b/.test(m) ||
        /\bovertraining\b/.test(m) ||
        /\brecovery\b/.test(m) ||
        /\bplan.*(adjust|improve|fix|change|opti)\b/.test(m)
    ) return 'performance';

    // MODE B — Knowledge (default for everything else)
    return 'knowledge';
};
// ─── Context Helpers ──────────────────────────────────────────────────────────

/**
 * Build a concise human-readable trend summary (never raw JSON).
 */
const buildTrendSummary = (trends = []) => {
    if (!trends.length) return 'No trend data yet.';
    return trends
        .slice(0, 5)
        .map(t => `- ${t.exercise}: ${t.volumeTrend}`)
        .join('\n');
};

/**
 * Build a short, structured performance context block.
 * Used ONLY in Performance Mode — never in Knowledge Mode.
 */
const buildPerformanceContext = (context, planSummary) => `
Streak: ${context.streak} day(s)
Weekly completion: ${context.weeklyCompletion}%
Missed workouts this week: ${context.missedWorkouts}
Weak muscle groups: ${context.weakMuscleGroups.length > 0 ? context.weakMuscleGroups.join(', ') : 'none detected'}
${planSummary ? `Active plan summary: ${planSummary}` : ''}

Recent trend highlights:
${buildTrendSummary(context.exerciseTrends)}
`.trim();

// ─── Mode-Specific System Prompts ─────────────────────────────────────────────

const KNOWLEDGE_SYSTEM_PROMPT = `You are a professional, evidence-based fitness coach.

You provide practical, accurate advice.
You are advisory only and cannot directly modify workout plans.

If asked to change a plan, explain what to do and direct the user to the Plan Builder.

If discussing exercises for a specific muscle, prioritize primary-target movements.

Keep responses clear and helpful.
Avoid medical diagnosis.`;

const PERFORMANCE_SYSTEM_PROMPT = `You are a read-only performance optimization coach.

You analyze structured training summaries and provide strategic guidance.
You are advisory only. You cannot modify plans or logs.
If asked to change the plan, explain what to do and direct the user to the Plan Builder.

Use only the provided performance summary. Do not invent metrics.
Do not restate raw data unless necessary.
Provide concise, analytical guidance.
Plain text only. No markdown formatting. No medical diagnosis.`;

// ─── Controller: Get Context ──────────────────────────────────────────────────

const getContext = async (req, res, next) => {
    try {
        const context = await aiContextService.getAIContext(req.user.id);
        res.status(httpStatus.OK).send(context);
    } catch (error) {
        next(error);
    }
};

// ─── Controller: Analyze Performance ─────────────────────────────────────────

const analyzePerformance = async (req, res, next) => {
    try {
        const userId = req.user.id;
        
        // Step A: Check cache before AI call
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
        }

        const now = new Date();
        const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

        // If cache exists and is fresh, return it immediately
        if (user.lastAnalysis && user.lastAnalysisAt) {
            const cacheAge = now - new Date(user.lastAnalysisAt);
            if (cacheAge < CACHE_TTL_MS) {
                console.log(`[AI] Cache hit for user ${userId}, age: ${Math.floor(cacheAge / 1000)}s`);
                return res.status(httpStatus.OK).send({
                    ...user.lastAnalysis,
                    cached: true,
                    lastAnalysisAt: user.lastAnalysisAt,
                });
            }
        }

        // Cache miss or expired — proceed with fresh analysis
        const context = await aiContextService.getAIContext(userId);

        if (context.streak === 0 && context.exerciseTrends.length === 0) {
            return res.status(httpStatus.OK).send({
                isInitialAdvice: true,
                summary: "I'm ready to analyze your performance! Start logging your workouts so I can track your volume trends and muscle frequency.",
                strengths: ['Willingness to start'],
                risks: ['No baseline data yet'],
                recommendation: 'Log your first workout today to establish your baseline.',
                cached: false,
                lastAnalysisAt: now,
            });
        }

        const systemPrompt = `ROLE: Experienced strength and conditioning coach.

OBJECTIVE: Interpret the structured training data and provide a concise performance evaluation.
Focus on consistency, progression, muscle balance, and risks.

INPUT_DATA:
Streak: ${context.streak} day(s)
Weekly completion: ${context.weeklyCompletion}%
Missed workouts: ${context.missedWorkouts}
Weak muscle groups: ${context.weakMuscleGroups.join(', ') || 'none'}

Recent trend highlights:
${buildTrendSummary(context.exerciseTrends)}

EVALUATION GUIDELINES:
- Higher streak = strong consistency.
- Increasing volume = progression.
- Decreasing/stable = plateau or fatigue risk.
- Weak muscle groups = imbalance/undertraining.
- Missed workouts = adherence or recovery issues.

RESPONSE REQUIREMENTS:
- DO NOT restate the raw data.
- Provide exactly: 1 summary (max 25 words), 2 strengths, 2 risks, 1 actionable recommendation.

OUTPUT FORMAT (STRICT JSON):
{"summary":"","strengths":["",""],"risks":["",""],"recommendation":""}

Return ONLY valid raw JSON.`;

        const start = Date.now();
        const analysis = await callLLM({
            mode: 'json',
            messages: [{ role: 'user', content: systemPrompt }],
            outputType: 'json',
        });
        console.log(`[AI] analyzePerformance LLM completed in ${Date.now() - start}ms`);

        if (!analysis) {
            throw new ApiError(httpStatus.SERVICE_UNAVAILABLE, 'AI service temporarily unavailable');
        }

        // Step B: Save to cache on successful analysis
        await User.findByIdAndUpdate(userId, {
            lastAnalysis: analysis,
            lastAnalysisAt: now,
        }, { new: true });
        console.log(`[AI] Cache updated for user ${userId}`);

        res.status(httpStatus.OK).send({
            ...analysis,
            cached: false,
            lastAnalysisAt: now,
        });
    } catch (error) {
        next(error);
    }
};

// ─── Controller: Adjust Plan ──────────────────────────────────────────────────

const adjustPlan = async (req, res, next) => {
    try {
        const { goal } = req.body;
        const userId = req.user.id;

        const [plan, context] = await Promise.all([
            WorkoutPlan.findOne({ userId }).lean(),
            aiContextService.getAIContext(userId),
        ]);

        if (!plan) {
            throw new ApiError(httpStatus.NOT_FOUND, 'No active workout plan found. Create one first.');
        }

        // Build muscle-aware plan summary
        const allExerciseIds = [...new Set(
            plan.workouts.flatMap(w => w.exercises.map(e => e.exerciseId.toString()))
        )];
        const exerciseDetails = await Exercise.find({ _id: { $in: allExerciseIds } })
            .select('name muscleGroup')
            .lean();
        const exerciseMuscleMap = {};
        exerciseDetails.forEach(ex => { exerciseMuscleMap[ex._id.toString()] = ex.muscleGroup; });

        const enrichedPlanSummary = plan.workouts.map(w => ({
            day: w.day,
            exerciseCount: w.exercises.length,
            muscleGroups: [...new Set(
                w.exercises.map(e => exerciseMuscleMap[e.exerciseId.toString()] || 'unknown')
            )],
        }));

        const planDaysList = plan.workouts.map(w => w.day);

        const systemPrompt = `ROLE: Strength Optimization Engine.
GOAL: Suggest structured workout plan modifications for "${goal}".

RULES:
- Return ONLY JSON.
- You cannot invent exercises.
- Max 25% total weekly volume change.
- Max 3 muscles modified at once.
- Cannot reduce any muscle below 1 exercise/week.
- Cannot delete entire workout days.
- Explain every change logically.
- If a muscle group already exists in the current plan, suggest increasing its volume (not adding a duplicate).

MODIFICATION TYPES (use EXACTLY these names):
increase_volume | reduce_volume | add_exercise | remove_exercise

USER DATA:
Current plan (days + muscle groups): ${JSON.stringify(enrichedPlanSummary)}
Weak muscles (from recent logs): ${JSON.stringify(context.weakMuscleGroups)}
Muscle volume distribution: ${JSON.stringify(context.muscleDistribution)}
Completion rate: ${context.weeklyCompletion}%

OUTPUT FORMAT (STRICT JSON):
{"modifications":[{"type":"MODIFICATION_TYPE","muscle":"muscle_name","deltaSets":2,"suggestedExercise":"exercise_name","reason":"explanation","day":"Monday"}],"summary":"overall strategy"}`;

        const start = Date.now();
        let suggestions = await callLLM({
            mode: 'json',
            messages: [{ role: 'user', content: systemPrompt }],
            outputType: 'json',
        });
        console.log(`[AI] adjustPlan LLM completed in ${Date.now() - start}ms`);

        if (!suggestions || !suggestions.modifications) {
            throw new ApiError(httpStatus.SERVICE_UNAVAILABLE, 'AI failed to generate suggestions.');
        }

        // ── Validation + Normalization ──────────────────────────────────────────

        // Fetch all exercise names for suggestedExercise validation
        const allExerciseNames = await Exercise.find({ isActive: true })
            .select('name')
            .lean()
            .then(exs => exs.map(e => e.name.toLowerCase()));

        let totalOriginalSets = 0;
        plan.workouts.forEach(w => w.exercises.forEach(e => (totalOriginalSets += e.sets)));

        const validated = [];
        for (const mod of suggestions.modifications) {
            // 1. Normalize and validate type
            let type = (mod.type || '').toLowerCase().trim().replace(/[\s-]/g, '_');
            if (!VALID_MODIFICATION_TYPES.includes(type)) {
                if (type.includes('increase')) type = 'increase_volume';
                else if (type.includes('reduce') || type.includes('decrease')) type = 'reduce_volume';
                else if (type.includes('add')) type = 'add_exercise';
                else if (type.includes('remove') || type.includes('delete')) type = 'remove_exercise';
                else {
                    console.warn(`[AI] adjustPlan: rejected unknown type="${mod.type}"`);
                    continue; // reject
                }
            }

            // 2. Validate muscle
            const muscle = (mod.muscle || '').toLowerCase().trim();
            if (!VALID_MUSCLES.includes(muscle)) {
                console.warn(`[AI] adjustPlan: rejected unknown muscle="${mod.muscle}"`);
                continue;
            }

            // 3. Validate day exists in current plan
            const day = mod.day || '';
            if (day && !planDaysList.includes(day)) {
                console.warn(`[AI] adjustPlan: rejected invalid day="${day}"`);
                continue;
            }

            // 4. Validate suggestedExercise exists in DB (if provided)
            const suggestedExercise = (mod.suggestedExercise || '').toLowerCase().trim();
            if (suggestedExercise && !allExerciseNames.includes(suggestedExercise)) {
                console.warn(`[AI] adjustPlan: unknown exercise="${mod.suggestedExercise}" — removing field`);
                mod.suggestedExercise = null; // allow mod but clear invalid exercise reference
            }

            // 5. Clamp deltaSets to reasonable range (1–5)
            const deltaSets = Math.min(5, Math.max(1, Math.round(Number(mod.deltaSets) || 2)));

            validated.push({ ...mod, type, muscle, deltaSets });
        }

        // 6. Enforce ≤25% total volume change
        let netDelta = 0;
        validated.forEach(mod => {
            if (mod.type === 'increase_volume' || mod.type === 'add_exercise') netDelta += mod.deltaSets;
            if (mod.type === 'reduce_volume' || mod.type === 'remove_exercise') netDelta -= mod.deltaSets;
        });

        if (Math.abs(netDelta) > totalOriginalSets * 0.25) {
            return res.status(httpStatus.OK).send({
                success: false,
                message: 'AI suggested too many changes (>25% volume). Refining recommendation...',
                refined: true,
            });
        }

        res.status(httpStatus.OK).send({
            modifications: validated,
            summary: suggestions.summary || '',
            currentPlan: plan,
            performance: context,
        });
    } catch (error) {
        next(error);
    }
};

// ─── Controller: Chat ─────────────────────────────────────────────────────────

const chat = async (req, res, next) => {
    try {
        const { message } = req.body;
        const userId = req.user.id;

        const [context, plan, session] = await Promise.all([
            aiContextService.getAIContext(userId),
            WorkoutPlan.findOne({ userId }).lean(),
            ChatSession.findOne({ userId }),
        ]);

        // ── MODE A: Direct DB Response ──────────────────────────────────────────
        const intent = classifyIntent(message);

        if (intent === 'direct') {
            const lowerMsg = message.toLowerCase();
            let fastReply = null;

            if (/\bstreak\b/.test(lowerMsg)) {
                fastReply = `Your current streak is ${context.streak} day${context.streak !== 1 ? 's' : ''}. ${context.streak >= 7 ? 'Incredible consistency!' :
                        context.streak >= 3 ? 'Keep it up!' :
                            'Start a new streak today!'
                    }`;
            } else if (/\bcompletion\b/.test(lowerMsg) || /\bweekly rate\b/.test(lowerMsg)) {
                fastReply = `Your weekly completion rate is ${context.weeklyCompletion}%. ${context.weeklyCompletion >= 80 ? 'Excellent week!' : 'Try to hit at least 80% this week.'
                    }`;
            } else if (/\bweak muscle\b/.test(lowerMsg) || /\bmuscle imbalance\b/.test(lowerMsg)) {
                fastReply = context.weakMuscleGroups.length > 0
                    ? `Your undertrained muscle groups based on recent logs are: ${context.weakMuscleGroups.join(', ')}. These are below 60% of your average weekly volume.`
                    : 'Your muscle volume looks balanced. No significant weak points detected in recent logs.';
            }

            if (fastReply) {
                await persistMessage(userId, message, fastReply);
                return res.status(httpStatus.OK).send({ reply: fastReply, source: 'direct', intent });
            }
        }

        // ── Build conversation history (trimmed) ────────────────────────────────
        const existingMessages = session?.messages?.slice(-MAX_HISTORY_MESSAGES) || [];

        // ── Build a brief plan summary (one-liner, only for performance mode) ───
        let planSummary = null;
        if (intent === 'performance' && plan) {
            const allExerciseIds = [...new Set(
                plan.workouts.flatMap(w => w.exercises.map(e => e.exerciseId.toString()))
            )];
            const exerciseDetails = await Exercise.find({ _id: { $in: allExerciseIds } })
                .select('name')
                .lean();
            const exMap = {};
            exerciseDetails.forEach(ex => { exMap[ex._id.toString()] = ex.name; });
            planSummary = plan.workouts
                .map(w => `${w.day}: ${w.exercises.map(e => exMap[e.exerciseId.toString()] || 'unknown').join(', ')}`)
                .join(' | ');
        }

        // ── Build messages array for LLM ────────────────────────────────────────
        const systemContent = intent === 'performance'
            ? `${PERFORMANCE_SYSTEM_PROMPT}\n\nPERFORMANCE SUMMARY:\n${buildPerformanceContext(context, planSummary)}`
            : KNOWLEDGE_SYSTEM_PROMPT;

        const llmMessages = [
            { role: 'system', content: systemContent },
            // Inject trimmed conversation history
            ...existingMessages.map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content })),
            { role: 'user', content: message },
        ];

        // ── Call LLM ────────────────────────────────────────────────────────────
        const start = Date.now();
        const aiReply = await callLLM({
            mode: intent === 'performance' ? 'performance' : 'knowledge',
            messages: llmMessages,
            outputType: 'text',
        });
        console.log(`[AI] chat (${intent}) completed in ${Date.now() - start}ms`);

        const reply = aiReply || "I'm having trouble connecting right now. Please try again in a moment.";

        await persistMessage(userId, message, reply);

        res.status(httpStatus.OK).send({ reply, source: 'llm', intent });
    } catch (error) {
        next(error);
    }
};

// ─── Helper: Persist messages to ChatSession ──────────────────────────────────

const persistMessage = async (userId, userMsg, assistantMsg) => {
    const newMessages = [
        { role: 'user', content: userMsg },
        { role: 'assistant', content: assistantMsg },
    ];

    const updated = await ChatSession.findOneAndUpdate(
        { userId },
        { $push: { messages: { $each: newMessages } } },
        { upsert: true, new: true }
    );

    if (updated.messages.length > SESSION_HISTORY_CAP) {
        await ChatSession.updateOne(
            { userId },
            { $set: { messages: updated.messages.slice(-SESSION_HISTORY_CAP) } }
        );
    }
};

// ─── Controller: Get Chat History ─────────────────────────────────────────────

const getChatHistory = async (req, res, next) => {
    try {
        const session = await ChatSession.findOne({ userId: req.user.id }).lean();
        res.status(httpStatus.OK).send({ messages: session?.messages || [] });
    } catch (error) {
        next(error);
    }
};

// ─── Controller: Clear Chat ───────────────────────────────────────────────────

const clearChat = async (req, res, next) => {
    try {
        await ChatSession.findOneAndUpdate(
            { userId: req.user.id },
            { $set: { messages: [] } },
            { upsert: true }
        );
        res.status(httpStatus.OK).send({ success: true, message: 'Chat history cleared.' });
    } catch (error) {
        next(error);
    }
};

export default {
    getContext,
    analyzePerformance,
    adjustPlan,
    chat,
    getChatHistory,
    clearChat,
};
