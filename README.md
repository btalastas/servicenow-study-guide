# ServiceNow Study Guide

A web application for studying for the ServiceNow Certified System Administrator
(CSA) and Certified Application Developer (CAD) certifications.

## Overview

The ServiceNow Study Guide is a tool for reviewing material covered on the CSA
and CAD exams. Users can choose how they want to study and which modules to
include in their question pool.

The project currently includes a Next.js starter page. The study modes and live
question retrieval below are planned and are not implemented yet.

## Planned Features

- Study independently.
- Choose from multiple study methods:
  - Flash cards
  - Jeopardy
  - Who Wants to Be a Millionaire
- Build a question pool from selected modules or include all modules.

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

Open http://localhost:3000. The starter page runs without AWS credentials.
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
- `npm run test:e2e`: run browser tests from `web/e2e/` once tests are added.
  Install Chromium first with `npx playwright install chromium`. No browser tests
  are included in the initial scaffold.

Application routes live in `web/src/app/`. Backend routes will use Next.js Route
Handlers with the Node.js runtime. DynamoDB access and grading must stay on the
server, with only learner-facing fields returned before answer reveal.

The existing `tests/`, `scripts/`, `data/`, and `deployment/` directories remain
locally ignored. New browser tests belong in `web/e2e/` so they can be versioned.
The historical question-bank scripts use Python; the web application uses JavaScript.

## Contributing

Project author: Bjorn Talastas

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for
details.

## Question Bank

The [question bank](data/question-bank/README.md) contains 338 practice questions
across eight modules, with answer choices, explanations, question types, and
`easy`/`medium`/`hard` difficulty levels. Use
[questions.dynamodb.jsonl](data/question-bank/questions.dynamodb.jsonl) for a
DynamoDB import from S3. Import instructions, the table/index definition, and
query guidance are included in the question bank documentation.

## Dependency checks

At setup, `npm audit` reported five high-severity development dependency findings
from the `braces` dependency chain in `eslint-config-next`. The suggested fix
would downgrade the Next.js lint configuration to version 14, so it was not
applied. Recheck with `npm audit` when upgrading the tooling.
