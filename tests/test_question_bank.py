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
            lines = (ROOT / source['file']).read_text().splitlines()
            self.assertTrue(lines[source['line'] - 1].startswith('Question ' + str(source['questionNumber'])))
        all_refs = {(s['file'], s['line']) for q in self.questions for s in q['sources']}
        self.assertEqual(len(all_refs), 303)

    def test_import_round_trip_and_attribute_types(self):
        lines = (bank.OUT / 'questions.dynamodb.jsonl').read_text().splitlines()
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
        self.assertEqual(restored, json.loads((bank.OUT / 'questions.json').read_text()))

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
