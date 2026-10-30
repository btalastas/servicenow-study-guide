# ServiceNow Study Guide

A web application for studying for the ServiceNow Certified System Administrator
(CSA) and Certified Application Developer (CAD) certifications.

## Overview

The ServiceNow Study Guide is a tool for reviewing material covered on the CSA
and CAD exams. Users can choose how they want to study and which modules to
include in their question pool.

The local Next.js app includes a CSA/CAD landing page, certificate-specific study-mode
selection, practice quizzes, timed exams, Jeopardy, and Who Wants to Be a Millionaire.
Flash cards use the embedded cards in imported question banks; live DynamoDB
retrieval remains planned. Current development focuses
on importing local files; no AWS setup is required for the implemented modes.

## Local practice quizzes and exams

Choose CSA or CAD, then Practice quizzes or Practice exams. Import a local JSON
question bank; parsing and grading happen in your browser without database calls.
For CSA, choose the existing data/question-bank/questions.json file. CAD requires
a CAD-labelled bank; the existing bank is CSA content. Imported files stay on your
device, and session state is lost on reload or navigation.

- Quizzes: select one or more modules and choose how many random questions to
  draw from that pool. Questions do not repeat within a session. Choose instant
  feedback or feedback at the end; checked answers are locked in instant mode.
- Exams: choose 60–80 randomly selected questions with a 90-minute countdown. The exam
  submits automatically on timeout; answers are revealed after submission.
- Results: percentage score, missed/unanswered questions with explanations, and
  accuracy by module with weaker areas listed first. Unanswered questions count
  as incorrect. Multi-select and ordering require exact answers.

Download the JSON template from either practice setup page. Use an object with
certificate set to csa or cad and a questions array (schema version 1). Each
question needs questionId, moduleId, moduleName, prompt, choices (id/text),
correctChoiceIds, explanation, questionType, and difficulty. Supported types are
single_choice, multiple_choice, true_false, scenario, and ordering. Difficulty is
easy, medium, or hard. The original CSA JSON array is accepted for compatibility.
Banks are limited to 10 MB and 5,000 questions; an exam needs at least the chosen question count (60–80).

Local files contain inspectable answer keys. UI reveal timing supports studying;
server-side answer protection will apply to the future hosted source. The bank is
supplementary practice material and still needs editorial review. Practice exams
sample the imported bank and do not reproduce official domain weighting.

Timing references: [CSA blueprint](https://nowlearning.servicenow.com/kb?id=kb_article_view&sysparm_article=KB0011554)
and [CAD blueprint](https://learning.servicenow.com/kb?id=kb_article_view&sysparm_article=KB0011498),
checked October 27, 2026. Defaults live in web/src/lib/study-options.js.

## Local Jeopardy and Millionaire

Choose either game after selecting CSA or CAD, then import the same local JSON
bank. Games pool across all modules; no module/difficulty selector is shown.
Difficulty controls only these games. Quizzes and exams include all difficulties.
All parsing, selection, scoring, and review happen in the browser without AWS calls.
Progress is lost on reload or navigation; replays draw fresh random questions.

### Jeopardy

The board has five random module columns and five rows: $100/$200 easy,
$300/$400 medium, and $500 hard. A module qualifies only if it has at least two
easy, two medium, and one hard question. At least five modules must qualify.
The game draws 25 unique clues and never substitutes a different difficulty.
Every eligible module in the bank can be selected. On mobile, scroll the board
sideways to reach all five columns.

Correct answers add the clue value; wrong answers and skipped clues subtract it.
Negative totals are allowed. Submitted clues cannot be played again. Each answer
reveals an explanation. Play all 25 clues or confirm an early finish; results show
earnings, accuracy, missed questions, and module study priorities. Unplayed clues
are not scored. All supported question types, including ordering, can appear.

### Who Wants to Be a Millionaire

Fifteen unique choice-based questions progress through five easy, five medium,
and five hard questions. The bank must contain at least five eligible questions
per difficulty. All modules are pooled. Single-answer, multi-select, true/false,
and choice-based scenarios are eligible; ordering questions are excluded.
Multi-select requires the exact set, without partial credit.

The prize ladder is $10, $50, $100, $200, $500, $1,000, $2,000, $5,000, $10,000,
$25,000, $50,000, $100,000, $250,000, $500,000, and $1,000,000. Completing easy
questions secures $500 and begins medium questions; completing medium secures
$25,000 and begins hard questions. A wrong answer ends the game with the last
guaranteed prize ($0 before the first checkpoint). Walk away before submitting an
answer to keep current winnings. Correct answers to all 15 questions win $1,000,000.
Results include earnings, accuracy, explanations for missed questions, and module
study priorities. The ladder, rows, and checkpoints are defined in
web/src/lib/game-rules.js.

## Local flash cards

Choose CSA or CAD, then Flash cards. Import a question bank with a `flashcards`
array on each question (the existing CSA `data/question-bank/questions.json`
contains 454 cards). Select one or more modules to study; each module shows its
card count. Select all or clear your selection, and optionally shuffle the deck.

Start the deck, reveal or hide each answer and its explanation, and use Previous
card / Next card to navigate. Answers are hidden whenever you change cards.
The deck shows your current position and module. At the last card, study again
or change modules. There is no timer or grading. Banks without embedded cards
show a message and cannot start a deck; a CAD bank must be labelled `cad`.
Files stay in the browser, and session progress is lost on reload or navigation.

## Planned Features

- Optional hosted question bank with server grading and database administration.
- Saved progress and account requirements remain to be decided.

## Requirements

Project requirements are documented in [REQUIREMENTS.md](REQUIREMENTS.md).

## Installation

Use Node.js 22.22.1 or newer within the Node.js 22 release line and npm.

```bash
cd web
npm ci
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000. The app runs without AWS credentials.
The environment template records the existing DynamoDB region, table, and index
for the future backend integration. Configure AWS credentials through a local
AWS profile or a deployment IAM role; never use NEXT_PUBLIC_ variables for secrets.

### Project layout

The `web/` directory contains the Next.js application, `package.json`,
`package-lock.json`, and application tooling configuration. Project documentation
and question-bank resources remain at the repository root.

### Stack

- Next.js App Router and React, using JavaScript.
- Material UI, Emotion, and the MUI Next.js cache provider for server rendering.
- AWS SDK v3 DynamoDB client and document client, installed for backend integration.
- Zod and server-only, installed for request validation and server module boundaries.
- ESLint, Prettier, and Playwright for development checks.

MUI integration follows the [official App Router guide](https://mui.com/material-ui/integrations/nextjs/).

## Usage

Run these commands from `web/`.

- `npm run dev`: start the development server.
- `npm run build`: create the production build.
- `npm start`: serve the production build.
- `npm run lint`: check JavaScript and React code.
- `npm run format`: format application and configuration files.
- `npm run format:check`: check formatting.
- `npm run test:unit`: run game-rule tests with the built-in Node test runner.
- `npm run test:e2e`: build the app and run practice and game browser tests from
  web/e2e/. Install Chromium first with npx playwright install chromium. Tests use
  a separate production server on port 3001. Set PLAYWRIGHT_CHANNEL=msedge to use
  an installed Microsoft Edge browser instead.

Application routes live in `web/src/app/`. Backend routes will use Next.js Route
Handlers with the Node.js runtime. DynamoDB access and hosted grading must stay on the
server, with only learner-facing fields returned before answer reveal.

Question-bank tests, scripts, data, source questions, and deployment documentation
are versioned with the application. New browser tests belong in `web/e2e/` so they can be versioned.
The historical question-bank scripts use Python; the web application uses JavaScript.

## Contributing

Project author: Bjorn Talastas

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for
details.

## Question Bank

The [question bank](data/question-bank/README.md) contains 338 practice questions
across eight modules, with answer choices, explanations, question types, and
`easy`/`medium`/`hard` difficulty levels. Each question also includes a `flashcards`
array, totaling 454 recall and focused concept cards across the same modules. Use
[questions.dynamodb.jsonl](data/question-bank/questions.dynamodb.jsonl) for a
DynamoDB import from S3. Import instructions, the table/index definition, and
query guidance are included in the question bank documentation.

## Dependency checks

On October 27, 2026, compatible dependency updates were applied, including
Next.js 16.4.3 and Zod 4.6.7 security fixes. The dependency audit reported zero
vulnerabilities. Recheck with npm audit when updating dependencies.
