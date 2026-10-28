# Project Requirements

This document tracks requirements for the ServiceNow Study Guide. Checked items
are completed; unchecked items and blank fields remain to be implemented or decided.

## Project Goals

- Primary goal:
  - Act as a supplmentary tool for studying for the ServiceNow CSA/CAD Certificates
- Target audience:
  - Individuals planning on taking the ServiceNow CSA/CAD Certificates
- Measures of success:
  - Confidence in taking the certification exams

## Functional Requirements

### Certificate Selection and Navigation

- [x] Landing page lets users choose CSA or CAD.
- [x] Each certificate has a page listing the planned study modes.
- [x] Each study mode has its own placeholder route and back navigation.

### Study Modes

- [ ] Flash cards
- [x] Jeopardy
- [x] Who Wants to Be a Millionaire
- [x] Practice quizzes
- [x] Practice exams

### Practice Quizzes and Exams

- [x] Practice quizzes let users choose one or more modules, including all modules.
- [x] Users choose a quiz question count from 1 up to the available module pool.
  Draw that many random questions without repetition from only the chosen modules.
- [x] Quiz users can choose instant feedback or feedback only after submission.
- [x] Instant feedback appears after committing an answer, showing whether it is
  correct and explaining the correct answer when it is incorrect.
- [x] An answer receiving instant feedback is locked for scoring; users cannot
  change it after seeing the explanation.
- [x] Practice exams use a certificate-specific duration matching the published
  exam blueprint. Current CSA and CAD defaults are 90 minutes and 60 questions.
- [x] Users can choose 60–80 questions for practice exams. Keep the 90-minute
  duration for every count; block starting if the imported bank is too small.
- [x] Exam sessions show a countdown and automatically submit when time expires.
- [x] Exam answers and explanations remain hidden until submission or timeout.
- [x] Exam sessions draw from the selected certificate's full imported bank;
  module selection applies to quizzes. Do not substitute CSA questions for missing CAD content.
- [x] Prevent starting an exam if there are too few eligible questions for the
  configured exam length; explain what content is missing.
- [x] After either session, show correct answers / total questions and percentage
  score. Unanswered questions count as incorrect; multi-select requires the exact
  correct set, with no partial credit.
- [x] Results list each incorrect or unanswered question, the user's answer, the
  correct answer, its explanation, and its module.
- [x] Results show correct / total and percentage by module, with weaker modules
  ranked first as suggested study priorities. Never report untested modules as
  weaknesses or claim that a practice score predicts certification success.
- [x] Results remain available for review until the learner starts a new session
  or leaves the page; persistent history is a separate future requirement.

Timing references, checked October 27, 2026:
[CSA exam blueprint](https://nowlearning.servicenow.com/kb?id=kb_article_view&sysparm_article=KB0011554)
and [CAD exam blueprint](https://learning.servicenow.com/kb?id=kb_article_view&sysparm_article=KB0011498).
Keep duration and question count in certificate configuration so future blueprint
updates do not require changes to session logic.

### Local-File Game Modes

The current development focus is local importing. Database integration remains
future work; neither game makes backend or AWS requests.

#### Jeopardy

- [x] Pool questions across all modules in the imported bank; do not offer a
  manual module or difficulty selector for this game.
- [x] Randomly choose five distinct modules that can fill the board. Each module
  must have at least two easy, two medium, and one hard question. Consider all
  qualifying modules; explain shortages and block starting if fewer than five qualify.
- [x] Show five module columns and five rows: $100/$200 easy, $300/$400 medium,
  and $500 hard. Draw unique random questions at the required difficulty.
- [x] Let users choose any unused clue. Lock answers after submission and show
  the correct answer and explanation. Support choice and ordering questions.
- [x] Track dollars: add the clue value for correct answers, subtract it for
  incorrect answers or skipped clues. Negative totals are allowed.
- [x] Prevent replaying a used clue or awarding its value twice.
- [x] Complete after all 25 clues, or allow an explicitly confirmed early finish.
  Show total earnings, played-question accuracy, missed explanations, and module
  study priorities. Unplayed clues are not scored.

#### Who Wants to Be a Millionaire

- [x] Pool choice-based questions from all modules in the imported bank, with no
  manual module/difficulty selector. Ordering questions are excluded because they
  cannot be answered as multiple choice; show this restriction at setup.
- [x] Support single-answer, multiple-answer, true/false, and choice-based scenario
  questions. Multi-select requires the exact answer set with no partial credit.
- [x] Randomly draw 15 unique questions: five easy, then five medium, then five
  hard. Require at least five eligible questions per tier; block incomplete banks
  instead of substituting another difficulty.
- [x] Use this prize ladder: $10, $50, $100, $200, $500, $1,000, $2,000, $5,000,
  $10,000, $25,000, $50,000, $100,000, $250,000, $500,000, $1,000,000.
- [x] Move to medium after five correct answers ($500 checkpoint), and hard after
  ten correct answers ($25,000 checkpoint). Track current and guaranteed earnings.
- [x] Lock a submitted answer and show its explanation. A wrong answer ends the
  game and pays the most recently cleared checkpoint (or $0 before the first).
- [x] Allow a confirmed walk-away before submitting an answer, keeping current
  winnings without scoring the unsubmitted question.
- [x] Finish with $1,000,000 after all 15 correct answers. Show played-question
  accuracy, missed explanations, and study priorities; replay starts at $0.

Game progress lasts only for the current page session, like local quizzes/exams.
Restarting a game draws a new random board or ladder from the imported bank.

### Question Pool

- [x] Users can select individual modules for local quizzes.
- [x] Users can include all modules for local quizzes.
- [x] Difficulty is used for automatic progression in Jeopardy and Millionaire only.
  Quizzes and exams draw across all difficulties and have no difficulty selector.
- [ ] The web application retrieves question pools from DynamoDB through its backend.

### Hosted Question Bank (Planned)

Development branch: `codex/dynamodb-question-bank`, based on the working local-file
application on `main`. The requirements below are future work; branch creation
and planning do not mean database integration is implemented.

- [ ] Add a question-source choice: Local file (default) or Hosted question bank.
- [ ] Keep local importing and studying usable without AWS credentials or requests.
- [ ] Use shared certificate, module, and question-selection contracts for both
  sources; apply difficulty only to game progression, not quiz/exam filtering.
- [ ] Retrieve hosted questions through Next.js Node.js Route Handlers and
  server-only DynamoDB modules. Never access DynamoDB directly from the browser.
- [ ] Query selected quiz modules or game difficulty tiers through ByModuleDifficulty, handle
  pagination, and draw unique random samples from the eligible pool. Avoid
  full-table scans during study sessions.
- [ ] Support selectable quiz sizes and 60–80-question exams with the existing
  90-minute timer, submission behavior, and module-level results.
- [ ] Validate certificate, module IDs, game difficulty tiers, counts, and submitted answers
  on the server. Reject invalid counts and insufficient question pools clearly.
- [ ] Define explicit certificate metadata for hosted content before enabling CAD.
  Treat the existing bank as CSA; do not serve CSA content as a CAD fallback.
- [ ] Create hosted sessions that bind question IDs, content versions, answer
  locks, and exam deadlines to a server-issued session identity. Decide session
  storage and expiry before implementation; an in-memory process is not durable.
- [ ] Grade hosted answers on the server. Return only prompts, choice IDs/text,
  and necessary learner metadata before reveal. Strip answer keys, question and
  choice explanations, and editorial metadata from unrevealed responses.
- [ ] Instant-feedback quizzes reveal an answer only after submission and lock it
  for scoring. Exams reveal answers only after final submission or expiry.
- [ ] Enforce exam expiry and final scores on the server; do not trust the browser
  clock, score, or client-supplied answer keys. Make final submission idempotent.
- [ ] Handle loading, empty pools, throttling, and unavailable AWS configuration
  clearly. Preserve the learner's source choice instead of silently switching it.
- [ ] Use a dedicated least-privilege backend role for the required table/index
  reads. Grant write access separately only if a reviewed feature needs it.
- [ ] Set request-size/count limits, abuse controls, bounded retries, and a caching
  policy that reduces repeated reads without sharing protected session answers.
- [ ] Review capacity mode, table/index usage, monitoring, and budget alerts before
  enabling hosted access; define a feature switch to disable the hosted source.
- [ ] Test retrieval, pagination, answer concealment, grading, expiry, duplicate
  submissions, and failure handling with mocked AWS calls before a live smoke test.

Hosted content administration is a later phase: define editors and authorization,
certificate/version metadata, validation, and a repeatable update process for the
existing table. Keep create/update/delete operations outside learner-facing routes.

### User Accounts

- [ ] Decide whether user accounts are required.
- [ ] Authentication requirements:
- [ ] User profile requirements:

### Progress and Results

- [ ] Decide whether study progress will be saved.
- [x] Implement quiz/exam percentage scoring as specified above.
- [x] Implement missed-question review and module-level study recommendations.

### Content Management

- [x] Generate a question bank from `questions/*.txt`, preserving source references
  and merging exact duplicates.
- [x] Add missing answer choices and include answer keys, explanations, module,
  question type, and difficulty for every question.
- [x] Generate a readable JSON bank and a DynamoDB JSON Lines import file using
  `scripts/build_question_bank.py`.
- [x] Upload the import file to a private, encrypted S3 bucket and import it into
  a new DynamoDB table.
- [x] Validate import completion, item counts, stored content, and index queries.
- [x] Document reproducible import commands and table/index configuration in
  [deployment/aws](deployment/aws/README.md).
- [ ] Define who can edit study content.
- [ ] Define how future question additions and edits update the existing table;
  S3 import creates a new table and is not the ongoing update mechanism.
- [ ] Review release-dependent questions before publishing them to learners.

## Non-Functional Requirements

### Accessibility

- Accessibility standard or goals:

### Performance

- Expected response time:
- Expected number of users:

### Security and Privacy

- Data to protect: AWS credentials and hosted question answer keys before answer reveal.
- Local file mode reads and grades entirely in the browser; answer keys are inspectable.
  Local files are never uploaded to the backend. Hosted DynamoDB mode remains planned.
- Authorization requirements: the web application must use a dedicated backend
  IAM role with access limited to the required table and index operations.
- [x] Block public access to the S3 import bucket and encrypt the uploaded file.
- [ ] Return only learner-facing question fields before grading or answer reveal.
- AWS credentials and login-session caches must not be committed to Git or
  embedded in frontend code.
- Privacy requirements:

### Compatibility

- Supported browsers:
- Supported devices and screen sizes:

## Technical Requirements

- Application directory: `web/`, including npm manifests, source, and tooling configuration.

- Frontend technology: Next.js App Router, React, and Material UI with Emotion; JavaScript.
- Backend technology: Next.js Route Handlers using the Node.js runtime (planned).
- Runtime: Node.js 22.22.1 or newer within the Node.js 22 release line; npm with a committed lockfile.
- Database SDK: AWS SDK for JavaScript v3 with DynamoDBDocumentClient.
- Request validation: Zod; mark database and grading modules with server-only.
- Development tooling: ESLint, Prettier, and Playwright (Chromium; tests in web/e2e/).
- [x] Install application dependencies and configure a runnable Next.js/MUI starter.
- [x] Configure linting, formatting, and the browser-test runner.
- [ ] Implement backend question retrieval, request validation, and grading.
- [x] Add browser tests for local study flows and answer reveal.
- [ ] Add hosted-source integration and browser tests without AWS credentials.
- Database: Amazon DynamoDB, `ServiceNowQuestionBank`, in `us-east-1`.
- Table key: `questionId` (String partition key), with no sort key.
- Query index: `ByModuleDifficulty`, using `moduleKey` (String partition key)
  and `difficultyKey` (String sort key), with all attributes projected.
- Initial capacity: provisioned 5 read / 5 write units for the table and 5 read /
  5 write units for the index; no auto scaling configured for this deployment.
- Import source: `data/question-bank/questions.dynamodb.jsonl`, uploaded to S3.
- Import configuration: [deployment/aws/import-request.json](deployment/aws/import-request.json).
- Backend access: retrieve individual questions by ID and query selected modules
  and difficulties using the index; handle pagination when building question pools.
- Hosting or deployment platform:
- External services or APIs:

## Content Requirements

- Question-bank modules: Modernized work experience, Instance configuration,
  Application configuration, Data management, Self-service, Productivity,
  Utilities, and Instance security.
- CAD modules to include:
- Question formats: single choice, multiple choice, true/false, scenario, and ordering.
- Difficulty values: `easy`, `medium`, and `hard`.
- Initial bank: 338 questions, comprising 274 unique source questions and 64
  additional practice questions (eight per module).
- Source and review process: retain provenance, answer origin, and editorial
  review notes. Treat the bank as supplementary practice material, not an
  official certification question bank. See [question-bank documentation](data/question-bank/README.md).

## Out of Scope

- List features or responsibilities that are intentionally excluded:

## Milestones

| Milestone | Description | Target date | Status |
| --- | --- | --- | --- |
| 1 | Generate, import, and verify the 338-question bank in DynamoDB | Completed 2026-10-05 | Complete |
| 2 | Create a local Next.js web app with CSA/CAD selection, study-mode selection, and basic page routing | Completed 2026-10-27 | Complete |
| 3 | Implement local-bank practice quizzes and timed exams with feedback and results | Completed 2026-10-27 | Complete |
| 4 | Implement local-file Jeopardy and Millionaire with difficulty progression and dollar counters | Completed 2026-10-28 | Complete |
| 5 | Add optional hosted-source selection and validated, paginated DynamoDB retrieval | TBD | Planned |
| 6 | Implement protected hosted sessions, server grading, exam expiry, and integration tests | TBD | Planned |
| 7 | Define hosted content administration, update workflow, and operational cost controls | TBD | Planned |

## Open Questions

- [ ] Where will hosted session state and deadlines be stored, and how will sessions expire?
- [ ] What anonymous-session identity or account model will hosted study use?
- [ ] What certificate metadata and content versions will hosted questions use?
- [ ] What cache lifetime, request limits, capacity mode, and budget thresholds are appropriate?
- [ ] Who can maintain hosted content, and what review is required before publication?

## Acceptance Criteria

- [x] Every imported question includes choices, a valid answer key, explanation,
  module, question type, and an allowed difficulty value.
- [x] The initial import completes with 338 imported items and zero errors.
- [x] `ServiceNowQuestionBank` and `ByModuleDifficulty` are ACTIVE.
- [x] Read back all 338 records and confirm every attribute matches the local bank.
- [x] A module 4 / hard index query returns the expected nine questions.
- [x] Save deployment commands and [verification evidence](deployment/aws/verification.json).
- [ ] The web application can retrieve questions by quiz module or game difficulty tier
  without exposing answers before the intended reveal.

- [x] Quiz setup supports module selection and optional instant feedback.
- [x] Timed exams submit on expiry and reveal results only after completion.
- [x] Quiz/exam results include score percentage, missed-question explanations,
  and module-level study priorities.

### Hosted Source Acceptance Criteria (Future)

- [ ] Local-file sessions make no AWS requests, including when hosted mode is disabled.
- [ ] Hosted sessions return the requested number of unique questions from
  eligible quiz modules or game difficulty tiers, and block when the pool is too small.
- [ ] No unrevealed hosted response contains answer keys or explanations.
- [ ] Server grading and deadlines remain authoritative when client requests are
  altered; duplicate final submissions return the same completed result.
- [ ] Missing CAD content and AWS failures produce actionable messages.
- [ ] Hosted results match local scoring semantics and module-level reporting.
- [ ] Required IAM permissions, configuration, live smoke-test steps, and cost
  controls are documented before the hosted source is enabled for learners.

### Local Game Acceptance Criteria

- [x] Both games import the same validated local JSON format, respect CSA/CAD bank
  labels, and make no backend/AWS requests.
- [x] A Jeopardy board has five distinct eligible module columns, 25 unique clues,
  the configured difficulty/value rows, and a dollar counter that cannot award twice.
- [x] Millionaire advances easy → medium → hard at the configured checkpoints and
  reaches $1,000,000 only after 15 correct answers, with no repeated question IDs.
- [x] Incorrect answers, skips, walk-away, early finish, final completion, and
  replay produce the documented totals, feedback, and results.
- [x] Rule tests and browser tests cover shortages, certificate mismatch, scoring,
  difficulty progression, answer locking, and existing quiz/exam regression flows.
