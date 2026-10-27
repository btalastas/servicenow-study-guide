import { z } from 'zod';

const questionSchema = z
  .object({
    questionId: z.string().trim().min(1).max(200),
    moduleId: z.union([z.string().min(1), z.number().int().positive()]),
    moduleName: z.string().trim().min(1).max(200),
    prompt: z.string().trim().min(1).max(10000),
    choices: z
      .array(
        z.object({
          id: z.string().min(1).max(50),
          text: z.string().trim().min(1).max(5000),
        }),
      )
      .min(2)
      .max(30),
    correctChoiceIds: z.array(z.string().min(1)).min(1).max(30),
    explanation: z.string().trim().min(1).max(10000),
    questionType: z.enum([
      'single_choice',
      'multiple_choice',
      'true_false',
      'scenario',
      'ordering',
    ]),
    difficulty: z.enum(['easy', 'medium', 'hard']),
    selectionCount: z.number().int().positive().optional(),
    schemaVersion: z.literal(1).optional(),
  })
  .superRefine((q, ctx) => {
    const ids = q.choices.map((c) => c.id);
    const answers = q.correctChoiceIds;
    const invalid =
      new Set(ids).size !== ids.length ||
      new Set(answers).size !== answers.length ||
      answers.some((id) => !ids.includes(id)) ||
      (q.selectionCount !== undefined && q.selectionCount !== answers.length) ||
      (['single_choice', 'true_false'].includes(q.questionType) &&
        answers.length !== 1) ||
      (q.questionType === 'ordering' && answers.length !== ids.length);
    if (invalid)
      ctx.addIssue({
        code: 'custom',
        message: 'Choice IDs, answers, or selection count are inconsistent.',
      });
  });

const questionsSchema = z.array(questionSchema).min(1).max(5000);

export function parseQuestionBank(value, certificate) {
  let questions;
  if (Array.isArray(value)) {
    if (certificate !== 'csa')
      throw Error(
        'CAD banks must include certificate: "cad" and a questions array. The existing unlabelled bank is CSA only.',
      );
    questions = questionsSchema.parse(value);
  } else {
    const bank = z
      .object({
        certificate: z.enum(['csa', 'cad']),
        schemaVersion: z.literal(1).optional(),
        questions: questionsSchema,
      })
      .parse(value);
    if (bank.certificate !== certificate)
      throw Error(
        `This is a ${bank.certificate.toUpperCase()} bank. Choose a ${certificate.toUpperCase()} bank.`,
      );
    questions = bank.questions;
  }
  if (new Set(questions.map((q) => q.questionId)).size !== questions.length)
    throw Error('Question IDs must be unique.');
  const names = new Map();
  for (const q of questions) {
    const key = String(q.moduleId);
    if (names.has(key) && names.get(key) !== q.moduleName)
      throw Error('Each module ID must have one consistent name.');
    names.set(key, q.moduleName);
  }
  return questions;
}

export function isCorrect(question, response = []) {
  if (
    response.length !== question.correctChoiceIds.length ||
    new Set(response).size !== response.length
  )
    return false;
  return question.questionType === 'ordering'
    ? response.every((id, i) => id === question.correctChoiceIds[i])
    : response.every((id) => question.correctChoiceIds.includes(id));
}

export function summarize(questions, responses) {
  const modules = new Map();
  const missed = [];
  let correct = 0;
  for (const q of questions) {
    const key = String(q.moduleId);
    if (!modules.has(key))
      modules.set(key, { id: key, name: q.moduleName, correct: 0, total: 0 });
    const moduleResult = modules.get(key);
    moduleResult.total++;
    if (isCorrect(q, responses[q.questionId])) {
      correct++;
      moduleResult.correct++;
    } else missed.push(q);
  }
  return {
    correct,
    total: questions.length,
    percent: questions.length
      ? Math.round((correct / questions.length) * 100)
      : 0,
    missed,
    modules: [...modules.values()]
      .map((m) => ({ ...m, percent: Math.round((m.correct / m.total) * 100) }))
      .sort((a, b) => a.percent - b.percent || a.name.localeCompare(b.name)),
  };
}

export function shuffle(questions) {
  const result = [...questions];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function formatTime(seconds) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

export function secondsRemaining(deadline) {
  return Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
}
