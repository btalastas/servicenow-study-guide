import { z } from 'zod';
import { parseQuestionBank } from './practice.js';

const cardSchema = z.object({
  flashcardId: z.string().trim().min(1).max(250),
  front: z.string().trim().min(1).max(10000),
  back: z.string().trim().min(1).max(10000),
  explanation: z.string().trim().min(1).max(10000).optional(),
  sourceQuestionId: z.string().optional(),
  moduleId: z.union([z.string(), z.number()]).optional(),
  moduleName: z.string().optional(),
  reviewStatus: z.string().optional(),
});

export function parseFlashcardBank(value, certificate) {
  const questions = parseQuestionBank(value, certificate);
  const raw = Array.isArray(value) ? value : value.questions;
  const seen = new Set();
  return questions.map((question, index) => {
    const cards =
      z.array(cardSchema).max(100).optional().parse(raw[index].flashcards) ??
      [];
    for (const card of cards) {
      if (seen.has(card.flashcardId))
        throw Error('Flash card IDs must be unique.');
      seen.add(card.flashcardId);
      if (
        (card.sourceQuestionId !== undefined &&
          card.sourceQuestionId !== question.questionId) ||
        (card.moduleId !== undefined &&
          String(card.moduleId) !== String(question.moduleId)) ||
        (card.moduleName !== undefined &&
          card.moduleName !== question.moduleName)
      )
        throw Error(
          'Flash cards must belong to their parent question and module.',
        );
    }
    return {
      ...question,
      flashcards: cards.map((card) => ({
        ...card,
        sourceQuestionId: question.questionId,
        moduleId: question.moduleId,
        moduleName: question.moduleName,
        explanation: card.explanation ?? question.explanation,
      })),
    };
  });
}

export function flashcardModules(bank) {
  const modules = new Map();
  for (const question of bank) {
    if (!question.flashcards.length) continue;
    const id = String(question.moduleId);
    if (!modules.has(id))
      modules.set(id, { id, name: question.moduleName, count: 0 });
    modules.get(id).count += question.flashcards.length;
  }
  return [...modules.values()].sort((a, b) =>
    a.id.localeCompare(b.id, undefined, { numeric: true }),
  );
}

export function selectFlashcards(bank, moduleIds) {
  return bank
    .filter((question) => moduleIds.includes(String(question.moduleId)))
    .flatMap((question) => question.flashcards);
}
