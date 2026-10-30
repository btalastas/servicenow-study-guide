import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  flashcardModules,
  parseFlashcardBank,
  selectFlashcards,
} from '../src/lib/flashcards.js';

const source = JSON.parse(
  fs.readFileSync(
    new URL('../../data/question-bank/questions.json', import.meta.url),
    'utf8',
  ),
);

test('actual bank preserves all 454 embedded cards and filters selected modules', () => {
  const bank = parseFlashcardBank(source, 'csa');
  assert.equal(
    selectFlashcards(
      bank,
      flashcardModules(bank).map((module) => module.id),
    ).length,
    454,
  );
  const selected = selectFlashcards(bank, ['3', '4']);
  assert.equal(selected.length, 179);
  assert.ok(selected.every((card) => [3, 4].includes(card.moduleId)));
  assert.equal(selectFlashcards(bank, []).length, 0);
  assert.deepEqual(
    flashcardModules(bank).map((module) => module.count),
    [30, 31, 92, 87, 53, 66, 33, 62],
  );
});

test('flashcard imports reject malformed, duplicate, or miscategorized cards', () => {
  for (const mutate of [
    (q) => {
      q.flashcards[0].front = '';
    },
    (q) => {
      q.flashcards[0].back = '';
    },
    (q) => {
      q.flashcards.push(q.flashcards[0]);
    },
    (q) => {
      q.flashcards[0].moduleId = 99;
    },
    (q) => {
      q.flashcards[0].sourceQuestionId = 'other-question';
    },
  ]) {
    const question = structuredClone(source[0]);
    mutate(question);
    assert.throws(() => parseFlashcardBank([question], 'csa'));
  }
});

test('legacy banks have no cards and certificate boundaries remain enforced', () => {
  const question = structuredClone(source[0]);
  delete question.flashcards;
  const bank = parseFlashcardBank([question], 'csa');
  assert.deepEqual(flashcardModules(bank), []);
  assert.throws(() => parseFlashcardBank(source, 'cad'));
  assert.equal(
    parseFlashcardBank({ certificate: 'cad', questions: [source[0]] }, 'cad')[0]
      .flashcards.length,
    source[0].flashcards.length,
  );
});
