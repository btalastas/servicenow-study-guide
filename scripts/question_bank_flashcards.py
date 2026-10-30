"""Attach module-categorized flash cards while preserving practice questions."""
import re

from flashcard_content import FRONTS, focused_cards


def recall_front(question):
    if question['questionId'] in FRONTS:
        return FRONTS[question['questionId']]
    front = re.sub(r'\s*(?:Select|Choose)\s+(?:all that apply|\d+(?:\s+answers)?|two)\.?',
                   '', question['prompt'], flags=re.I).strip()
    if question['questionType'] == 'true_false':
        front = 'True or false: ' + front
    return front


def answer_text(question):
    choices = {c['id']: c['text'] for c in question['choices']}
    answers = [choices[key] for key in question['correctChoiceIds']]
    if question['questionType'] == 'ordering':
        return '\n'.join(f'{i}. {answer}' for i, answer in enumerate(answers, 1))
    if len(answers) > 1:
        return '\n'.join('- ' + answer for answer in answers)
    return answers[0]


def attach_flashcards(questions):
    focused = focused_cards()
    ids = {q['questionId'] for q in questions}
    assert set(FRONTS) <= ids, 'Unknown flashcard prompt source'
    assert set(focused) <= ids, 'Unknown focused flashcard source'
    for question in questions:
        kind = {'true_false': 'true_false', 'ordering': 'sequence'}.get(
            question['questionType'], 'recall')
        entries = [('primary', recall_front(question), answer_text(question), kind)]
        entries.extend((key, front, back, 'concept')
                       for key, front, back in focused.get(question['questionId'], []))
        question['flashcards'] = [
            dict(flashcardId=f'fc_{question["questionId"]}_{key}',
                 sourceQuestionId=question['questionId'],
                 moduleId=question['moduleId'], moduleName=question['moduleName'],
                 difficulty=question['difficulty'], kind=card_kind,
                 front=front, back=back, explanation=question['explanation'],
                 reviewStatus=question['reviewStatus'])
            for key, front, back, card_kind in entries
        ]


def validate_flashcards(questions):
    seen = set()
    for question in questions:
        assert question['flashcards'], question['questionId']
        for card in question['flashcards']:
            assert card['flashcardId'] not in seen, card['flashcardId']
            seen.add(card['flashcardId'])
            assert card['sourceQuestionId'] == question['questionId']
            for key in ('moduleId', 'moduleName', 'difficulty', 'reviewStatus'):
                assert card[key] == question[key], (card['flashcardId'], key)
            assert card['kind'] in ('recall', 'concept', 'sequence', 'true_false')
            assert all(card[key].strip() for key in ('front', 'back', 'explanation'))
            assert not re.search(r'\b(?:Select|Choose)\s+\d+', card['front'], re.I), card['flashcardId']
