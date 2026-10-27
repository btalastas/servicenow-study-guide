#!/usr/bin/env python3
"""Build local DynamoDB S3-import data without AWS credentials or third-party packages."""
import argparse
from collections import Counter
import hashlib
import json
from pathlib import Path
import re
import string

from question_bank_content import (
    ADDITIONAL, DEFAULT_MODULE, MODULE_OVERRIDES, MODULES, PRACTICE_MODULES, WORKSHEETS,
)

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'data' / 'question-bank'
HEADER = re.compile(r'^Question\s+(\d+)(?::|Correct|Incorrect)\s*$', re.M)
MARKERS = {'Your selection is correct', 'Your selection is incorrect',
           'Your answer is correct', 'Your answer is incorrect',
           'Correct selection', 'Correct answer'}
CORRECT = {'Your selection is correct', 'Your answer is correct', 'Correct selection', 'Correct answer'}
ALIASES = {
    'building_core_application_components': 'building',
    'configure_self_service_automation': 'self_service',
    'exploring_the_servicenow_environment': 'exploring',
    'foundations_of_the_servicenow_experience': 'foundations',
    'manage_data': 'manage', 'package_enhancements_for_training': 'package',
    'reporting_features_and_additional_tools': 'reporting',
}
REFERENCES = {
    'navigation': 'https://www.servicenow.com/docs/r/platform-user-interface/using-the-next-experience-global-header.html',
    'acl': 'https://www.servicenow.com/docs/r/platform-security/access-control/exploring-access-control-list.html',
    'roles': 'https://www.servicenow.com/docs/r/platform-administration/user-administration/base-system-roles.html',
    'imports': 'https://www.servicenow.com/docs/r/integrate-applications/system-import-sets/import-sets-landing-page.html',
    'coalesce': 'https://www.servicenow.com/docs/r/integrate-applications/system-import-sets/t_CreatingAFieldMap.html',
    'ui_policy': 'https://www.servicenow.com/docs/r/xanadu/application-development/servicenow-sdk/fluent-ui-policy-api.html',
    'update_sets': 'https://www.servicenow.com/docs/r/application-development/system-update-sets/customizations-tracked-update-sets.html',
    'help': 'https://www.servicenow.com/docs/r/build-workflows/workflow-studio/use-flow-designer-help-panel.html',
    'wiki': 'https://www.servicenow.com/docs/r/servicenow-platform/knowledge-management/additional-plugins-km.html',
    'variables': 'https://servicenow.github.io/sdk/4.10.0/guides/service-catalog-variables-guide',
    'scope': 'https://developer.servicenow.com/print_page.do?category=now-platform&identifier=pro-dev-intro&module=guide&release=yokohama',
}


def norm(value):
    return re.sub(r'\s+', ' ', value).strip()


def worksheet_keys():
    result = {}
    for alias, text in WORKSHEETS.items():
        for line in text.strip().splitlines():
            number, answer, explanation = line.split('|')
            result[(alias, int(number))] = (answer, explanation)
    return result


def source_blocks():
    for path in sorted((ROOT / 'questions').glob('*.txt')):
        text = path.read_text(encoding='utf-8-sig')
        headers = list(HEADER.finditer(text))
        if not headers:
            raise ValueError(f'No questions found: {path}')
        section = 1
        previous = 0
        for index, match in enumerate(headers):
            number = int(match[1])
            if number < previous:
                section += 1
            previous = number
            stop = headers[index + 1].start() if index + 1 < len(headers) else len(text)
            yield {
                'file': path.name, 'number': number, 'section': section,
                'line': text[:match.start()].count('\n') + 1,
                'body': text[match.end():stop].strip(),
            }


def parse_practice(source):
    lines = [line.strip() for line in source['body'].splitlines() if line.strip()]
    explanation_indices = [i for i, line in enumerate(lines) if line == 'Explanation']
    if not explanation_indices:
        raise ValueError(f'Missing explanation blocks: {source}')
    starts = []
    for index in explanation_indices:
        start = index - 1
        if index >= 2 and lines[index - 2] in MARKERS:
            start -= 1
        starts.append(start)
    prompt = norm(' '.join(lines[:starts[0]]))
    choices, answers = [], []
    for i, index in enumerate(explanation_indices):
        choice_id = string.ascii_uppercase[i]
        stop = starts[i + 1] if i + 1 < len(starts) else len(lines)
        end = next((j for j in range(index + 1, stop) if lines[j] == 'Domain'), stop)
        explanation = norm(' '.join(lines[index + 1:end]))
        choices.append({'id': choice_id, 'text': lines[index - 1], 'explanation': explanation})
        if index >= 2 and lines[index - 2] in CORRECT:
            answers.append(choice_id)
    if not answers:
        raise ValueError(f'No marked correct answers: {source["file"]}:{source["number"]}')
    return prompt, choices, answers


def parse_worksheet(source, key):
    lines = [line.strip() for line in source['body'].splitlines() if line.strip()]
    prompt = lines[0]
    choices = []
    for line in lines[1:]:
        match = re.match(r'^([A-H])(?:[.)]\s*|\s+)(.+)$', line)
        if match:
            choices.append({'id': match[1], 'text': match[2].strip()})
        elif source['file'] == 'manage_data.txt' and source['number'] in (3, 4):
            choices.append({'id': string.ascii_uppercase[len(choices)], 'text': line})
        else:
            raise ValueError(f'Unparsed worksheet line: {source["file"]}:{source["number"]}: {line}')
    answer, explanation = key
    generated = not choices
    if generated:
        texts = answer.split('~')
        if len(texts) != 4:
            raise ValueError(f'Expected four authored choices: {source}')
        choices = [{'id': string.ascii_uppercase[i], 'text': text} for i, text in enumerate(texts)]
        answers = ['A']
    else:
        answers = list(answer)
    return prompt, choices, answers, explanation, generated


def difficulty(prompt, answers):
    if any(word in prompt.lower() for word in ['coalesce', 'access control', 'acl', 'difference between', 'extends', 'server-side']):
        return 'hard'
    if len(answers) > 1 or len(prompt.split()) > 27:
        return 'medium'
    return 'easy'


def infer_type(prompt, answers):
    if len(answers) > 1:
        return 'multiple_choice'
    if len(prompt.split()) > 27:
        return 'scenario'
    return 'single_choice'


def revise(question, note, reference=None):
    question['editorialNotes'].append(note)
    question['answerOrigin'] = 'editorially_corrected'
    if reference:
        question['references'].append(REFERENCES[reference])


def replace_choice(question, choice_id, text, explanation):
    choice = next(c for c in question['choices'] if c['id'] == choice_id)
    choice['text'] = text
    if 'explanation' in choice:
        choice['explanation'] = explanation


def edit_source(question, source, alias):
    n = source['number']
    file = source['file']
    if file == 'practice_exam1.txt':
        if n == 2:
            question['prompt'] = 'In the classic UI16 interface, which are the three main interface areas? Select 3.'
            revise(question, 'Scoped the question to classic UI16; Next Experience uses different navigation terminology.')
        elif n == 8:
            replace_choice(question, 'E', 'A role can be assigned to only one user', 'The same role can be assigned to multiple users, directly or through groups.')
            revise(question, 'Replaced a duplicated incorrect choice with a distinct distractor.')
        elif n == 10:
            question['prompt'] = 'An admin must make Email mandatory for user records created through forms and import sets. With the relevant import-set enforcement enabled, which feature supports this requirement?'
            revise(question, 'Data Policies enforce mandatory/read-only behavior, not arbitrary email-format validation.')
        elif n == 12:
            question['prompt'] = 'Which activities can be part of transferring an update set from development to test, using either XML export/import or an update source? Select 3.'
            revise(question, 'Clarified that XML export/import and remote retrieval are alternative transfer paths.')
        elif n == 15:
            text = 'Table-level access is evaluated before field-level access; specific, inherited, and wildcard rules participate at their applicable levels.'
            replace_choice(question, 'A', text, 'A user needs applicable table and field access; wildcard rules are not a separate final phase after all field checks.')
            revise(question, 'Corrected the misleading placement of wildcard ACLs in a separate final evaluation stage.', 'acl')
        elif n == 23:
            question['prompt'] = question['prompt'].replace('Select 3', 'Select 2')
            revise(question, 'Only two of the supplied options are marked and explained as correct; corrected the selection count.')
        elif n == 42:
            text = 'The Event Log contains generated event records; the Event Registry defines named events available for event-driven processing.'
            replace_choice(question, 'C', text, 'The Event Log does not record every action in the system; consumers such as notifications and Script Actions respond to events.')
            revise(question, 'Removed the claim that the Event Log captures all system activity or that the registry alone defines processing.')
        elif n == 45:
            question['prompt'] = 'Shaun creates a table with the suffix messages in the custom application scope x_acme_pet. What is its internal table name?'
            replace_choice(question, 'C', 'x_acme_pet_messages', 'A custom scoped table includes the application namespace before its table suffix.')
            revise(question, 'Supplied a concrete namespace; x_messages omitted the application namespace.', 'scope')
        elif n == 60:
            question['prompt'] = 'Which update set should be used to transfer ordinary business records, such as incident records, between instances?'
            question['correctChoiceIds'] = ['C']
            question['explanation'] = 'No update set: use a suitable data export/import or integration mechanism. Update sets package supported configuration changes.'
            for choice in question['choices']:
                choice['explanation'] = question['explanation']
            revise(question, 'Corrected the supplied answer from Named update set to No update set for business data.', 'update_sets')
    if file == 'practice_exam2.txt':
        if n == 5:
            replace_choice(question, 'C', 'The Group tab shows reports shared with a group to which the current user belongs', 'Group access depends on report sharing and group membership.')
            replace_choice(question, 'F', 'The All tab shows all reports available to the logged-in user', 'All does not bypass report visibility permissions.')
            revise(question, 'Corrected audience wording so All does not imply access to every report in the instance.')
        elif n == 6:
            replace_choice(question, 'C', 'sys_user.department', 'The internal table name is sys_user; field ACLs use table.field notation.')
            revise(question, 'Corrected user.department to sys_user.department.', 'acl')
        elif n == 15:
            replace_choice(question, 'B', 'A base table does not extend another table', 'Base describes the table inheritance position rather than whether it is supplied or custom.')
            replace_choice(question, 'E', 'Core tables are supplied with the platform; whether a table can be extended depends on its definition', 'Not every supplied table is necessarily extensible.')
            revise(question, 'Removed unsupported claims that all base tables are supplied and all core tables are extensible.')
        elif n == 27:
            replace_choice(question, 'C', 'Remove a field from the form layout using its remove control', 'Removing a field from a layout does not delete its dictionary definition or stored data.')
            revise(question, 'Distinguished removing a field from the form from deleting the database field.')
        elif n == 52:
            question['prompt'] = 'When a developer creates a custom table with Create access controls enabled, which four standard operations receive generated ACLs? Select 4.'
            revise(question, 'Made the table wizard access-control option explicit.')
        elif n == 55:
            question['prompt'] += ' Assume classic Allow If record ACLs and no other rule grants access to admin_notes.'
            revise(question, 'Made the absence of other granting ACLs explicit for the wildcard/specific-field scenario.', 'acl')
    if alias == 'building' and n == 15:
        question['prompt'] = 'Alex needs different form layouts for an administrator audience and an end-user audience. Which presentation feature can provide this? Assume data security is handled separately with ACLs.'
        revise(question, 'Clarified presentation versus security; form views alone cannot protect field data.', 'acl')
    if alias == 'building' and n == 22:
        question['prompt'] = 'In standard list text search, which symbol can prefix a search term to perform a contains search?'
        revise(question, 'Replaced the vague wildcard claim with the specific leading-asterisk list-search behavior.')
    if alias == 'building' and n == 23:
        question['prompt'] = 'When creating a table with menu and module creation selected, which navigation entries can the wizard create? Select 2.'
        revise(question, 'Clarified the table creation options instead of claiming navigation objects are always created.')
    if alias == 'self_service' and n == 4:
        question['prompt'] = 'When all the listed feedback features are enabled, which four actions can provide feedback on a knowledge article? Select 4.'
        revise(question, 'Four supplied choices provide feedback, including marking the article unhelpful; corrected Select 3.')
    if alias == 'self_service' and n == 6:
        question['prompt'] = 'Which three choices are named Service Catalog variable types? Select 3.'
        revise(question, 'Clarified exact type names: password-like input uses Masked, avoiding a vague common-types test.', 'variables')
    if alias == 'self_service' and n == 28:
        question['prompt'] = 'With the Knowledge Management Wiki Support plugin enabled, which two article body types can be used? Select 2.'
        revise(question, 'Added the plugin prerequisite for Wiki articles.', 'wiki')
    if alias == 'manage' and n == 8:
        question['prompt'] = 'Which three descriptions identify the field label, internal field name, and stored field value? Select 3.'
        revise(question, 'Narrowed the prompt to avoid ambiguity with the maximum-length property in choice D.')
    if alias == 'manage' and n == 14:
        question['prompt'] = 'With Create access controls enabled when a custom table is created, which standard operation ACLs are generated? Select 4.'
        revise(question, 'Added the table wizard ACL creation prerequisite.')
    if alias == 'manage' and n == 17:
        question['prompt'] += ' Assume read ACLs, no inherited rule grants additional access, and the name ACL grants access only to Jill.'
        revise(question, 'Stated assumptions needed to distinguish specific-field ACLs from a wildcard.', 'acl')
    if alias == 'reporting' and n == 21:
        question['prompt'] = 'Which five methods can distribute a report or make it available to an audience, subject to permissions and feature availability? Select 5.'
        revise(question, 'Five supplied options are distribution methods; corrected Select 4.')
    # Clearly identify source-specific material that needs release-specific review.
    if (alias == 'foundations' and n == 9) or (alias == 'reporting' and n in (14, 18)) or (file == 'practice_exam1.txt' and n in (6, 49)):
        question['reviewStatus'] = 'needs_release_review'
        question['editorialNotes'].append('Training terminology or exact interface controls vary; review against the release used for study.')


def shuffle_authored(question):
    """Deterministic shuffle without changing IDs, so order and answer IDs stay independent."""
    question['choices'].sort(key=lambda c: hashlib.sha256((question['questionId'] + c['text']).encode()).hexdigest())
    # Relabel after shuffling while preserving any answer sequence.
    mapping = {c['id']: string.ascii_uppercase[i] for i, c in enumerate(question['choices'])}
    for choice in question['choices']:
        choice['id'] = mapping[choice['id']]
    question['correctChoiceIds'] = [mapping[i] for i in question['correctChoiceIds']]
    if question['questionType'] != 'ordering':
        question['correctChoiceIds'].sort()


def finish(question, should_shuffle=False):
    question['moduleName'] = MODULES[question['moduleId']]
    question['schemaVersion'] = 1
    question['contentKind'] = 'practice'
    question['moduleKey'] = f'MODULE#{question["moduleId"]:02d}'
    question['difficultyKey'] = f'{question["difficulty"]}#{question["questionId"]}'
    question['selectionCount'] = len(question['correctChoiceIds'])
    question['scoring'] = 'ordered_exact' if question['questionType'] == 'ordering' else 'exact_set'
    if should_shuffle and question['questionType'] != 'true_false':
        shuffle_authored(question)
    if not question['explanation']:
        question['explanation'] = ' '.join(c['explanation'] for c in question['choices'] if c['id'] in question['correctChoiceIds'])
    return question


def build():
    keys = worksheet_keys()
    questions, dedup, manifest = [], {}, []
    for source in source_blocks():
        practice = source['file'].startswith('practice_exam')
        alias = None
        if practice:
            prompt, choices, answers = parse_practice(source)
            exam = int(re.search(r'exam(\d+)', source['file'])[1])
            module = PRACTICE_MODULES[exam][source['number'] - 1]
            explanation, generated = '', False
            origin = 'supplied_answer_key'
        else:
            alias = ALIASES[Path(source['file']).stem]
            if alias == 'reporting' and source['section'] == 1:
                alias = 'self_service'
            prompt, choices, answers, explanation, generated = parse_worksheet(source, keys[(alias, source['number'])])
            module = MODULE_OVERRIDES.get(alias, {}).get(source['number'], DEFAULT_MODULE[alias])
            origin = 'authored_answer_key'
        # Merge only exact content matches, preserving every occurrence and source line.
        signature = json.dumps([norm(prompt), [norm(c['text']) for c in choices]], ensure_ascii=False)
        source_ref = {'file': 'questions/' + source['file'], 'questionNumber': source['number'], 'section': source['section'], 'line': source['line']}
        if signature in dedup:
            existing = dedup[signature]
            existing['sources'].append(source_ref)
            manifest.append({**source_ref, 'questionId': existing['questionId'], 'duplicate': True})
            continue
        identifier = 'src_' + hashlib.sha256(signature.encode()).hexdigest()[:16]
        question = dict(questionId=identifier, moduleId=module, prompt=prompt,
                        choices=choices, correctChoiceIds=answers, explanation=explanation,
                        difficulty=difficulty(prompt, answers), questionType=infer_type(prompt, answers),
                        origin='source', answerOrigin=origin, choicesGenerated=generated,
                        reviewStatus='not_independently_verified', editorialNotes=[], references=[], sources=[source_ref])
        edit_source(question, source, alias)
        question['questionType'] = infer_type(question['prompt'], question['correctChoiceIds'])
        finish(question, generated)
        questions.append(question)
        dedup[signature] = question
        manifest.append({**source_ref, 'questionId': identifier, 'duplicate': False})
    counts = Counter()
    for line in ADDITIONAL.strip().splitlines():
        module, level, kind, prompt, choices, answers, explanation = line.split('|')
        module = int(module)
        counts[module] += 1
        question = dict(questionId=f'gen_m{module:02d}_{counts[module]:03d}', moduleId=module,
                        difficulty=level, questionType=kind, prompt=prompt,
                        choices=[{'id': string.ascii_uppercase[i], 'text': text} for i, text in enumerate(choices.split('~'))],
                        correctChoiceIds=list(answers), explanation=explanation, origin='generated',
                        answerOrigin='authored_answer_key', choicesGenerated=True,
                        reviewStatus='not_independently_verified', editorialNotes=[], references=[], sources=[])
        questions.append(finish(question, True))
    validate(questions, manifest)
    return questions, manifest


def validate(questions, manifest):
    ids = [q['questionId'] for q in questions]
    assert len(ids) == len(set(ids)), 'Duplicate primary keys'
    assert len(manifest) == sum(1 for _ in source_blocks()), 'Missing source coverage'
    for q in questions:
        context = q['questionId']
        assert q['difficulty'] in ('easy', 'medium', 'hard'), context
        assert q['moduleId'] in MODULES, context
        assert q['questionType'] in ('single_choice', 'multiple_choice', 'scenario', 'true_false', 'ordering'), context
        assert q['prompt'].strip() and q['explanation'].strip(), context
        choice_ids = [c['id'] for c in q['choices']]
        assert 2 <= len(choice_ids) <= 26 and len(choice_ids) == len(set(choice_ids)), context
        assert all(c['text'].strip() for c in q['choices']), context
        assert len({norm(c['text']).casefold() for c in q['choices']}) == len(choice_ids), context
        answers = q['correctChoiceIds']
        assert answers and len(answers) == len(set(answers)) and set(answers) <= set(choice_ids), context
        if q['questionType'] in ('single_choice', 'scenario', 'true_false'):
            assert len(answers) == 1, context
        elif q['questionType'] == 'multiple_choice':
            assert 1 < len(answers) < len(choice_ids), context
        elif q['questionType'] == 'ordering':
            assert set(answers) == set(choice_ids), context
        if q['questionType'] == 'true_false':
            assert {c['text'] for c in q['choices']} == {'True', 'False'}, context
        selection = re.search(r'(?:Select|Choose)\s+(\d+)', q['prompt'], re.I)
        if selection:
            assert int(selection[1]) == len(answers), (context, q['prompt'], answers)
        assert q['selectionCount'] == len(answers), context
        assert len(json.dumps({'Item': {k: marshal(v) for k, v in q.items()}}).encode()) < 400 * 1024, context
    for module in MODULES:
        generated = [q for q in questions if q['moduleId'] == module and q['origin'] == 'generated']
        assert len(generated) == 8, module
        assert {q['difficulty'] for q in generated} == {'easy', 'medium', 'hard'}, module


def marshal(value):
    if isinstance(value, bool):
        return {'BOOL': value}
    if isinstance(value, str):
        return {'S': value}
    if isinstance(value, int):
        return {'N': str(value)}
    if isinstance(value, list):
        return {'L': [marshal(v) for v in value]}
    if isinstance(value, dict):
        return {'M': {k: marshal(v) for k, v in value.items()}}
    raise TypeError(type(value))


def render(questions, manifest):
    stats = {
        'totalQuestions': len(questions), 'sourceOccurrences': len(manifest),
        'uniqueSourceQuestions': sum(q['origin'] == 'source' for q in questions),
        'duplicatesMerged': sum(m['duplicate'] for m in manifest),
        'additionalQuestions': sum(q['origin'] == 'generated' for q in questions),
        'sourceQuestionsWithGeneratedChoices': sum(q['origin'] == 'source' and q['choicesGenerated'] for q in questions),
        'byModule': {str(m): {'name': name, 'count': sum(q['moduleId'] == m for q in questions)} for m, name in MODULES.items()},
        'byDifficulty': dict(sorted(Counter(q['difficulty'] for q in questions).items())),
        'byQuestionType': dict(sorted(Counter(q['questionType'] for q in questions).items())),
        'byReviewStatus': dict(sorted(Counter(q['reviewStatus'] for q in questions).items())),
        'sourceFiles': {str(p.relative_to(ROOT)): hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted((ROOT / 'questions').glob('*.txt'))},
    }
    corrections = [{k: q[k] for k in ('questionId', 'sources', 'reviewStatus', 'editorialNotes', 'references')}
                   for q in questions if q['editorialNotes']]
    pretty = lambda data: json.dumps(data, indent=2, ensure_ascii=False) + '\n'
    return {
        'questions.json': pretty(questions),
        'questions.dynamodb.jsonl': ''.join(json.dumps({'Item': {k: marshal(v) for k, v in q.items()}}, ensure_ascii=False, separators=(',', ':')) + '\n' for q in questions),
        'source-manifest.json': pretty(manifest), 'summary.json': pretty(stats),
        'editorial-review.json': pretty(corrections), 'references.json': pretty(REFERENCES),
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true', help='Validate content and ensure committed output matches a fresh build')
    args = parser.parse_args()
    questions, manifest = build()
    files = render(questions, manifest)
    OUT.mkdir(parents=True, exist_ok=True)
    for filename, content in files.items():
        path = OUT / filename
        if args.check:
            if not path.exists() or path.read_text() != content:
                raise SystemExit(f'Out of date: {path}; run python3 scripts/build_question_bank.py')
        else:
            path.write_text(content, encoding='utf-8')
    print(f'Validated {len(questions)} questions and {len(manifest)} source occurrences; ' + ('artifacts are current.' if args.check else f'wrote artifacts to {OUT}.'))


if __name__ == '__main__':
    main()
