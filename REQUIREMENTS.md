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

### Study Modes

- [ ] Flash cards
- [ ] Jeopardy
- [ ] Who Wants to Be a Millionaire
- [ ] Other:

### Question Pool

- [ ] Users can select individual modules.
- [ ] Users can include all modules.
- [ ] Users can filter questions by difficulty: easy, medium, or hard.
- [ ] The web application retrieves question pools from DynamoDB through its backend.

### User Accounts

- [ ] Decide whether user accounts are required.
- [ ] Authentication requirements:
- [ ] User profile requirements:

### Progress and Results

- [ ] Decide whether study progress will be saved.
- [ ] Scoring requirements:
- [ ] Reporting requirements:

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

- Data to protect: AWS credentials and question answer keys before answer reveal.
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
- Development tooling: ESLint, Prettier, and Playwright (Chromium; future tests in web/e2e/).
- [x] Install application dependencies and configure a runnable Next.js/MUI starter.
- [x] Configure linting, formatting, and the browser-test runner.
- [ ] Implement backend question retrieval, request validation, and grading.
- [ ] Add browser tests for study flows and answer reveal.
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
| 2 | Connect the web application backend to the question table and index | TBD | Not started |

## Open Questions

- [ ] Question or decision still needed:

## Acceptance Criteria

- [x] Every imported question includes choices, a valid answer key, explanation,
  module, question type, and an allowed difficulty value.
- [x] The initial import completes with 338 imported items and zero errors.
- [x] `ServiceNowQuestionBank` and `ByModuleDifficulty` are ACTIVE.
- [x] Read back all 338 records and confirm every attribute matches the local bank.
- [x] A module 4 / hard index query returns the expected nine questions.
- [x] Save deployment commands and [verification evidence](deployment/aws/verification.json).
- [ ] The web application can retrieve questions by selected module and difficulty
  without exposing answers before the intended reveal.
