# ServiceNow question bank

The import contains **338 practice questions** across the eight requested modules:
274 unique questions from the supplied text files and 64 additional questions
(eight per module). All 303 source occurrences are accounted for; 29 exact
duplicates were merged. Choices were added to 109 unique source questions.

## Files

| File | Purpose |
| --- | --- |
| [questions.dynamodb.jsonl](questions.dynamodb.jsonl) | **Import this file into DynamoDB through S3.** |
| [questions.json](questions.json) | Equivalent readable JSON for review or local development. |
| [import-request.example.json](import-request.example.json) | AWS CLI import request, including table and query index definitions. |
| [summary.json](summary.json) | Counts by module, difficulty, and type; source file hashes. |
| [source-manifest.json](source-manifest.json) | Every original question occurrence mapped to its final question ID. |
| [editorial-review.json](editorial-review.json) | Corrections, clarified assumptions, and release-specific review notes. |
| [references.json](references.json) | Official documentation consulted for selected concepts and corrections. |

## Import into AWS

This package was imported into AWS and verified on October 5, 2026. See
[deployment documentation](../../deployment/aws/README.md) for the completed deployment.
The instructions below describe how to create a new import.

For a provisioned-capacity setup, use
[import-request.provisioned.example.json](import-request.provisioned.example.json)
in place of the original on-demand example below. It allocates 5 read and 5 write
capacity units to the table and another 5 of each to its index: 10 read and 10
write units total. It does not configure auto scaling. When using the console,
choose Standard table class, provisioned capacity, and disable read/write auto
scaling for both the table and index to keep those allocations fixed. Other
tables and indexes also count toward your account's eligible free allowance;
S3 storage and the import operation have separate pricing.

DynamoDB's S3 import creates a **new table**, rather than appending to an existing
one. Use a new table name if `ServiceNowQuestionBank` already exists. Importing
into an existing table requires a separate PutItem/BatchWriteItem loader; this
JSONL file is not a `batch-write-item` request body.

1. Choose an S3 bucket accessible to your AWS identity and the target AWS Region.
2. Upload only the import file to a dedicated object/prefix:

   ```bash
   aws s3 cp data/question-bank/questions.dynamodb.jsonl \
     s3://YOUR_BUCKET/question-bank-import/questions.dynamodb.jsonl \
     --region YOUR_REGION
   ```

3. Copy `import-request.example.json` to a temporary working file and replace
   `REPLACE_WITH_YOUR_BUCKET`. Adjust `TableName` if needed. The object prefix in
   the example matches the upload command; keep other artifacts outside it.
4. Start the import, using the path to your edited request:

   ```bash
   aws dynamodb import-table \
     --cli-input-json file:///tmp/question-bank-import.json \
     --region YOUR_REGION
   ```

5. Inspect the returned import ARN until `ImportStatus` is `COMPLETED`:

   ```bash
   aws dynamodb describe-import \
     --import-arn YOUR_IMPORT_ARN \
     --region YOUR_REGION
   ```

The example assumes your usual AWS CLI credentials are configured and have
permissions for S3 access, DynamoDB import/table creation, and the import's
logging/encryption requirements. It uses on-demand billing. These commands create
AWS resources when you run them.

For the AWS console, upload the same object and use DynamoDB **Import from S3**.
Choose **DynamoDB JSON**, **no compression**, and a string partition key named
`questionId`, with no base-table sort key. Add the `ByModuleDifficulty` global
secondary index using string partition key `moduleKey`, string sort key
`difficultyKey`, and projection `ALL`.

The file follows AWS's [DynamoDB JSON import format](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/S3DataImport.Format.html):
one `{"Item": {...}}` object per line, using typed attributes such as `S`, `N`,
`BOOL`, `L`, and `M`. The [ImportTable API](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_ImportTable.html)
describes the import request. The readable JSON array is not the S3 import file.

## Question schema

| Attribute | Meaning |
| --- | --- |
| `questionId` | String primary key. Source IDs hash the original prompt and choices; generated IDs use a module and sequence. |
| `moduleId`, `moduleName` | Requested module number and display name. |
| `difficulty` | Exactly `easy`, `medium`, or `hard`. |
| `questionType` | `single_choice`, `multiple_choice`, `true_false`, `scenario`, or `ordering`. |
| `prompt` | Question presented to the learner. |
| `choices` | Ordered list of `{id, text}` objects; source exam choices also include explanations. |
| `correctChoiceIds` | Correct choice IDs; their order matters only for `ordering`. |
| `selectionCount` | Required number of selections; for ordering, the number of steps. |
| `explanation` | Answer rationale. |
| `scoring` | `exact_set` for selections or `ordered_exact` for sequencing. |
| `moduleKey` | Index partition key, such as `MODULE#04`. |
| `difficultyKey` | Index sort key, such as `hard#gen_m04_005`. |
| `origin`, `answerOrigin` | Distinguish supplied content, authored answers, and editorial corrections. |
| `choicesGenerated` | Whether the choices were authored for this bank. |
| `sources` | Original file, question number, section, and line for each occurrence. |
| `reviewStatus`, `editorialNotes`, `references` | Review limitations and selected supporting documentation. |
| `schemaVersion`, `contentKind` | `1` and `practice`. |

Single-answer scenarios use the same scoring as single-choice questions.
Multiple-answer questions require the exact correct set, with no partial credit.
Ordering questions require the exact ID sequence. Do not sort their answer keys.
Display ordering choices in their supplied shuffled order, then let users arrange
them. Choice IDs remain the scoring identifiers if the UI reshuffles choices.

Difficulty is an editorial estimate, not an official exam rating: easy questions
emphasize recall, medium questions apply concepts, and hard questions emphasize
interacting rules, multi-step processes, or troubleshooting. Source questions use
a consistent heuristic in the builder; new questions have explicitly assigned
levels. True/false and ordering questions add study variety and are not a claim
about the certification exam's current question formats.

## Querying from the future application

Use an application backend with AWS SDK credentials/roles to access the table.
Fetch one question with `GetItem` using `questionId`. Use a `Query` on
`ByModuleDifficulty` to get a module, optionally narrowed to a difficulty:

```text
IndexName: ByModuleDifficulty
KeyConditionExpression:
  moduleKey = :module AND begins_with(difficultyKey, :difficulty)
ExpressionAttributeValues (DynamoDB typed values):
  :module     = {"S": "MODULE#04"}
  :difficulty = {"S": "hard#"}
```

Omit the `begins_with` condition for all difficulties in a module. Query each
selected module for a combined pool; query all eight for the full bank. Paginate
using `LastEvaluatedKey`/`ExclusiveStartKey` until exhausted, then shuffle/sample
the combined pool in application code. A query's `Limit` does not provide a random
sample. Global secondary index reads are eventually consistent.

For exam-style practice, return only `questionId`, `moduleId`, `moduleName`,
`difficulty`, `questionType`, `prompt`, `selectionCount`, and the choice `id`/`text`
fields before submission. Keep `correctChoiceIds`, question and choice
explanations, and editorial metadata on the backend until grading/reveal.
Flashcards can intentionally reveal the answer. Learner progress should be stored
separately using the question ID.

## Coverage and editorial handling

| Module | Questions |
| --- | ---: |
| 1. Modernized work experience | 23 |
| 2. Instance configuration | 23 |
| 3. Application configuration | 66 |
| 4. Data management | 59 |
| 5. Self-service | 41 |
| 6. Productivity | 52 |
| 7. Utilities | 27 |
| 8. Instance security | 47 |

There are 137 easy, 159 medium, and 42 hard questions. The five formats include
158 single-choice, 100 multiple-choice, 68 scenarios, 8 true/false, and 4 ordering
questions.

The reporting source contains a repeated self-service section, and the application
components worksheet repeats question 21. Those duplicates retain all source
locations. The source manifest also distinguishes repeated numbering with a
`section` field. Similar questions with different wording remain separate.

Answer keys in completed practice exams come from **correct-answer markers**,
including missed correct selections, rather than from the original test-taker's
selected answers. Worksheets without keys have authored answers and rationales.
Source files have not been edited. Corrections include the `sys_user.department`
ACL name, business-data migration guidance, incorrect selection counts, scoped
table naming, and form-layout removal versus deleting a field.

This is supplementary practice material, not an official ServiceNow question
bank or a release-specific certification blueprint. The original files mix
classic and newer interfaces. Five entries are explicitly marked
`needs_release_review`; the others are `not_independently_verified`, reflecting
that no full expert or target-instance validation was performed. Documentation
references support selected concepts/corrections, not a claim that every source
answer was verified. Review against your intended ServiceNow release before
publishing the bank to learners.

## Rebuild and validate

Python 3 and its standard library are sufficient; no AWS credentials are needed.
Run from the repository root:

```bash
python3 scripts/build_question_bank.py
python3 scripts/build_question_bank.py --check
python3 -m unittest discover -s tests -v
```

The builder reads all nine `questions/*.txt` files, applies the editorial material
in `scripts/question_bank_content.py`, and writes deterministic artifacts.
Validation checks source coverage, unique IDs, valid answers, selection counts,
module/difficulty coverage, DynamoDB serialization round trips, known source
corrections, and ordering semantics. It also checks a conservative serialized
size bound below DynamoDB's item limit; the largest item is only a few kilobytes.

Editing an original prompt or choice changes its source-derived ID; keep original
sources stable and make editorial changes in the curation layer if learner
progress already refers to those IDs. When adding source questions, add their
answer curation and module mapping and update the intentional coverage tests.
