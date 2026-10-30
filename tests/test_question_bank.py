"""Content/import regression checks. Run with python3 -m unittest discover -s tests."""
import json
from pathlib import Path
import sys
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import build_question_bank as bank


def decode(attribute):
    if len(attribute) != 1:
        raise ValueError('Invalid AttributeValue')
    kind, value = next(iter(attribute.items()))
    if kind in ('S', 'BOOL'):
        return value
    if kind == 'N':
        return int(value)
    if kind == 'L':
        return [decode(v) for v in value]
    if kind == 'M':
        return {k: decode(v) for k, v in value.items()}
    raise ValueError(kind)


class BankTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.questions, cls.manifest = bank.build()

    def find_source(self, filename, number):
        return next(q for q in self.questions if any(s['file'] == 'questions/' + filename and s['questionNumber'] == number for s in q['sources']))

    def test_every_original_occurrence_is_accounted_for(self):
        self.assertEqual(len(self.manifest), 303)
        self.assertEqual(len(self.questions), 338)
        self.assertEqual(sum(m['duplicate'] for m in self.manifest), 29)
        for source in self.manifest:
            lines = (ROOT / source['file']).read_text(encoding='utf-8').splitlines()
            self.assertTrue(lines[source['line'] - 1].startswith('Question ' + str(source['questionNumber'])))
        all_refs = {(s['file'], s['line']) for q in self.questions for s in q['sources']}
        self.assertEqual(len(all_refs), 303)

    def test_import_round_trip_and_attribute_types(self):
        lines = (bank.OUT / 'questions.dynamodb.jsonl').read_text(encoding='utf-8').splitlines()
        restored = []
        for line in lines:
            obj = json.loads(line)
            self.assertEqual(set(obj), {'Item'})
            item = obj['Item']
            self.assertIn('BOOL', item['choicesGenerated'])
            self.assertIn('N', item['moduleId'])
            self.assertIn('S', item['questionId'])
            restored.append({k: decode(v) for k, v in item.items()})
        self.assertEqual(restored, self.questions)
        self.assertEqual(restored, json.loads((bank.OUT / 'questions.json').read_text(encoding='utf-8')))

    def test_flashcards_cover_every_question_and_preserve_module_and_review_context(self):
        cards = [c for q in self.questions for c in q['flashcards']]
        self.assertEqual(len(cards), 454)
        self.assertEqual(len({c['flashcardId'] for c in cards}), len(cards))
        self.assertEqual({c['sourceQuestionId'] for c in cards},
                         {q['questionId'] for q in self.questions})
        expected_counts = {1: 30, 2: 31, 3: 92, 4: 87, 5: 53, 6: 66, 7: 33, 8: 62}
        for module, expected in expected_counts.items():
            self.assertEqual(sum(c['moduleId'] == module for c in cards), expected)
        for q in self.questions:
            for card in q['flashcards']:
                for key in ('moduleId', 'moduleName', 'difficulty', 'reviewStatus'):
                    self.assertEqual(card[key], q[key])
        summary = json.loads(bank.render(self.questions, self.manifest)['summary.json'])
        self.assertEqual(summary['flashcards']['total'], len(cards))

    def test_flashcard_primary_answers_use_answer_ids_and_preserve_sequence(self):
        for q in self.questions:
            primary = q['flashcards'][0]
            choices = {c['id']: c['text'] for c in q['choices']}
            expected = [choices[i] for i in q['correctChoiceIds']]
            if q['questionType'] == 'ordering':
                self.assertEqual(primary['kind'], 'sequence')
                self.assertEqual(primary['back'].splitlines(),
                                 [f'{i}. {text}' for i, text in enumerate(expected, 1)])
            elif len(expected) > 1:
                self.assertEqual(primary['back'].splitlines(), ['- ' + text for text in expected])
            else:
                self.assertEqual(primary['back'], expected[0])
            if q['questionType'] == 'true_false':
                self.assertTrue(primary['front'].startswith('True or false: '))

    def test_flashcards_split_distinct_concepts_without_choice_dependent_prompts(self):
        scripts = next(q for q in self.questions if q['questionId'] == 'src_31e0c63891b00b9d')
        self.assertEqual({c['back'] for c in scripts['flashcards'][1:]},
                         {'onLoad.', 'onChange.', 'onSubmit.', 'onCellEdit.'})
        for q in self.questions:
            for card in q['flashcards']:
                self.assertNotRegex(card['front'].lower(), r'\b(?:following|below|select \d|choose \d)\b')

    def test_flashcards_do_not_change_existing_practice_content(self):
        from question_bank_flashcards import attach_flashcards
        practice = [{k: v for k, v in q.items() if k != 'flashcards'} for q in self.questions]
        before = json.dumps(practice, sort_keys=True)
        attach_flashcards(practice)
        self.assertEqual(before, json.dumps(
            [{k: v for k, v in q.items() if k != 'flashcards'} for q in practice], sort_keys=True))
        self.assertEqual(practice, self.questions)

    def test_source_answer_markers_are_not_user_results(self):
        question = self.find_source('practice_exam1.txt', 2)
        self.assertEqual({c['text'] for c in question['choices'] if c['id'] in question['correctChoiceIds']},
                         {'Application Navigator', 'Banner Frame', 'Content Frame'})
        # Incorrect selections in the original attempt must not become answer keys.
        self.assertNotIn('A', question['correctChoiceIds'])

    def test_known_source_errors_are_corrected(self):
        acl = self.find_source('practice_exam2.txt', 6)
        answer = next(c['text'] for c in acl['choices'] if c['id'] in acl['correctChoiceIds'])
        self.assertEqual(answer, 'sys_user.department')
        update_set = self.find_source('practice_exam1.txt', 60)
        self.assertEqual(update_set['correctChoiceIds'], ['C'])
        report = self.find_source('practice_exam1.txt', 23)
        self.assertEqual(report['selectionCount'], 2)

    def test_generated_questions_cover_modules_and_levels(self):
        for module in range(1, 9):
            group = [q for q in self.questions if q['origin'] == 'generated' and q['moduleId'] == module]
            self.assertEqual(len(group), 8)
            self.assertEqual({q['difficulty'] for q in group}, {'easy', 'medium', 'hard'})
            self.assertTrue({'single_choice', 'multiple_choice', 'true_false', 'scenario'} <= {q['questionType'] for q in group})

    def test_ordering_answer_survives_choice_shuffle(self):
        question = next(q for q in self.questions if q['questionId'] == 'gen_m07_007')
        choices = {c['id']: c['text'] for c in question['choices']}
        self.assertEqual([choices[i] for i in question['correctChoiceIds']],
                         ['Retrieve or import the update set', 'Preview it', 'Resolve preview problems', 'Commit and validate the result'])
        self.assertNotEqual(question['correctChoiceIds'], ['A', 'B', 'C', 'D'])

    def test_table_keys_and_index_query(self):
        request = json.loads((bank.OUT / 'import-request.example.json').read_text())
        table = request['TableCreationParameters']
        self.assertEqual(table['KeySchema'], [{'AttributeName': 'questionId', 'KeyType': 'HASH'}])
        for definition in table['AttributeDefinitions']:
            for q in self.questions:
                self.assertIsInstance(q[definition['AttributeName']], str)
        selected = [q for q in self.questions if q['moduleKey'] == 'MODULE#04' and q['difficultyKey'].startswith('hard#')]
        expected = [q for q in self.questions if q['moduleId'] == 4 and q['difficulty'] == 'hard']
        self.assertEqual(selected, expected)
        self.assertTrue(selected)


if __name__ == '__main__':
    unittest.main()
