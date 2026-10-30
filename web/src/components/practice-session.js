'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  LinearProgress,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  Typography,
  TextField,
} from '@mui/material';
import { examSettings } from '../lib/study-options';
import {
  formatTime,
  isCorrect,
  secondsRemaining,
  parseQuestionBank,
  shuffle,
  summarize,
} from '../lib/practice';

function answerText(question, ids) {
  if (!ids?.length) return 'Unanswered';
  return ids
    .map((id) => question.choices.find((c) => c.id === id)?.text ?? id)
    .join(question.questionType === 'ordering' ? ' → ' : '; ');
}

export default function PracticeSession({ certificate, mode }) {
  const isExam = mode === 'practice-exam';
  const settings = examSettings[certificate];
  const [bank, setBank] = useState([]);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedModules, setSelectedModules] = useState([]);
  const [feedback, setFeedback] = useState('instant');
  const [questionCount, setQuestionCount] = useState(
    String(isExam ? settings.questionCount : 10),
  );
  const [session, setSession] = useState(null);
  const [responses, setResponses] = useState({});
  const [locked, setLocked] = useState([]);
  const [index, setIndex] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [finished, setFinished] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [confirmFinish, setConfirmFinish] = useState(false);
  const deadline = useRef(0);
  const heading = useRef(null);
  const available = isExam
    ? bank.length
    : bank.filter((q) => selectedModules.includes(String(q.moduleId))).length;
  const requestedCount = Number(questionCount);
  const minimum = isExam ? settings.minQuestions : 1;
  const maximum = isExam ? settings.maxQuestions : available;
  const validCount =
    Number.isInteger(requestedCount) &&
    requestedCount >= minimum &&
    requestedCount <= maximum &&
    requestedCount <= available;

  function chooseModules(ids) {
    setSelectedModules(ids);
    const poolSize = bank.filter((q) =>
      ids.includes(String(q.moduleId)),
    ).length;
    if (poolSize > 0)
      setQuestionCount((old) =>
        Number(old) > poolSize ? String(poolSize) : old,
      );
  }

  useEffect(() => {
    if (!session || finished || !isExam) return;
    const tick = () => {
      const seconds = Math.max(
        0,
        Math.ceil((deadline.current - Date.now()) / 1000),
      );
      setRemaining(seconds);
      if (seconds === 0) {
        setTimedOut(true);
        setFinished(true);
        setConfirmFinish(false);
      }
    };
    const timer = setInterval(tick, 1000);
    window.addEventListener('focus', tick);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', tick);
    };
  }, [session, finished, isExam]);

  useEffect(() => {
    if (!session || finished) return;
    const warn = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [session, finished]);

  useEffect(() => {
    heading.current?.focus();
  }, [index, finished, session]);

  async function importBank(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setBank([]);
    setFileName('');
    setError('');
    setLoading(true);
    try {
      if (file.size > 10 * 1024 * 1024)
        throw Error('Choose a JSON file smaller than 10 MB.');
      const questions = parseQuestionBank(
        JSON.parse(await file.text()),
        certificate,
      );
      setBank(questions);
      if (!isExam) setQuestionCount(String(Math.min(10, questions.length)));
      setFileName(file.name);
      setSelectedModules([
        ...new Set(questions.map((q) => String(q.moduleId))),
      ]);
    } catch (err) {
      const issue = err.issues?.[0];
      setError(
        issue
          ? `Invalid question bank (${issue.path.join('.') || 'questions'}): ${issue.message}`
          : err.message,
      );
    } finally {
      setLoading(false);
      event.target.value = '';
    }
  }

  function start() {
    const pool = isExam
      ? bank
      : bank.filter((q) => selectedModules.includes(String(q.moduleId)));
    if (!validCount) return;
    const questions = shuffle(pool).slice(0, requestedCount);
    setResponses({});
    setLocked([]);
    setIndex(0);
    setFinished(false);
    setTimedOut(false);
    deadline.current = Date.now() + settings.minutes * 60 * 1000;
    setRemaining(settings.minutes * 60);
    setSession({ questions, instant: !isExam && feedback === 'instant' });
  }

  function reset() {
    setSession(null);
    setFinished(false);
    setConfirmFinish(false);
  }

  if (!session) {
    const modules = [
      ...new Map(bank.map((q) => [String(q.moduleId), q.moduleName])).entries(),
    ];
    const count = bank.filter((q) =>
      selectedModules.includes(String(q.moduleId)),
    ).length;
    return (
      <Stack spacing={3} sx={{ mt: 3 }}>
        <Alert severity="info">
          {isExam
            ? `${settings.minQuestions}–${settings.maxQuestions} questions · ${settings.minutes} minutes. Answers are revealed after submission.`
            : 'Choose modules, the number of random questions, and when you want feedback.'}{' '}
          Import a local question bank to begin. Your file stays in this
          browser; no database requests are made.
        </Alert>
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography component="h2" variant="h5" gutterBottom>
            Question bank
          </Typography>
          <Button component="label" variant="outlined" disabled={loading}>
            {loading
              ? 'Reading file…'
              : `Import ${certificate.toUpperCase()} question bank`}
            <input
              aria-label="Question bank JSON file"
              hidden
              type="file"
              accept=".json,application/json"
              onChange={importBank}
            />
          </Button>
          <Button href="/question-bank-template.json" download sx={{ ml: 1 }}>
            Download JSON template
          </Button>
          {fileName && (
            <Typography sx={{ mt: 2 }}>
              {fileName}: {bank.length} questions across {modules.length}{' '}
              modules.
            </Typography>
          )}
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Use JSON with a certificate field ({certificate}) and a questions
            array. Questions need IDs, module IDs and names, prompts, choices,
            correctChoiceIds, explanations, questionType, and difficulty.
            {certificate === 'csa' &&
              ' The existing data/question-bank/questions.json array is also supported.'}
            {certificate === 'cad' &&
              ' A CAD-labelled bank is required; the existing project bank covers CSA.'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Local files include answer keys, which can be inspected. Progress
            lasts for this session and is lost if you leave or reload. Practice
            material is not an official exam.
          </Typography>
        </Paper>
        {bank.length > 0 && !isExam && (
          <Paper variant="outlined" sx={{ p: 3 }}>
            <FormControl component="fieldset" fullWidth>
              <FormLabel component="legend">Modules to study</FormLabel>
              <FormGroup>
                <FormControlLabel
                  label="All modules"
                  control={
                    <Checkbox
                      checked={selectedModules.length === modules.length}
                      indeterminate={
                        selectedModules.length > 0 &&
                        selectedModules.length < modules.length
                      }
                      onChange={(e) =>
                        chooseModules(
                          e.target.checked ? modules.map(([id]) => id) : [],
                        )
                      }
                    />
                  }
                />
                {modules.map(([id, name]) => (
                  <FormControlLabel
                    key={id}
                    label={name}
                    control={
                      <Checkbox
                        checked={selectedModules.includes(id)}
                        onChange={(e) =>
                          chooseModules(
                            e.target.checked
                              ? [...selectedModules, id]
                              : selectedModules.filter((value) => value !== id),
                          )
                        }
                      />
                    }
                  />
                ))}
              </FormGroup>
            </FormControl>
            <FormControl component="fieldset" sx={{ mt: 3 }}>
              <FormLabel component="legend">Answer feedback</FormLabel>
              <RadioGroup
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              >
                <FormControlLabel
                  value="instant"
                  control={<Radio />}
                  label="Instant feedback after checking each answer"
                />
                <FormControlLabel
                  value="end"
                  control={<Radio />}
                  label="Feedback at the end"
                />
              </RadioGroup>
            </FormControl>
            <Typography sx={{ mt: 2 }}>
              {count} questions available in the selected modules. Quizzes are
              untimed.
            </Typography>
          </Paper>
        )}
        {bank.length > 0 && (
          <Paper variant="outlined" sx={{ p: 3 }}>
            <TextField
              label="Number of questions"
              type="number"
              value={questionCount}
              onChange={(e) => setQuestionCount(e.target.value)}
              disabled={!available}
              error={available > 0 && !validCount}
              slotProps={{ htmlInput: { min: minimum, max: maximum, step: 1 } }}
              helperText={
                isExam
                  ? `Choose ${minimum}–${maximum} questions. Your bank has ${available}; it must contain at least your chosen count.`
                  : available
                    ? `Choose 1–${available} questions from your selected modules.`
                    : 'Select at least one module.'
              }
              fullWidth
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Each session draws a fresh random sample without repeating a
              question within the session.
            </Typography>
          </Paper>
        )}
        <Box>
          <Button
            variant="contained"
            disabled={loading || !bank.length || !validCount}
            onClick={start}
          >
            Start {isExam ? 'exam' : 'quiz'}
          </Button>
        </Box>
      </Stack>
    );
  }

  if (finished) {
    const results = summarize(session.questions, responses);
    const priorities = results.modules.filter((m) => m.correct < m.total);
    return (
      <Stack spacing={3} sx={{ mt: 3 }}>
        <Typography ref={heading} tabIndex={-1} component="h2" variant="h4">
          {isExam ? 'Exam' : 'Quiz'} results
        </Typography>
        {timedOut && (
          <Alert severity="info">
            Time expired. Your exam was submitted automatically.
          </Alert>
        )}
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography variant="h3" component="p">
            {results.percent}%
          </Typography>
          <Typography>
            {results.correct} correct out of {results.total} questions.
            Unanswered questions count as incorrect.
          </Typography>
        </Paper>
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography component="h3" variant="h5" gutterBottom>
            Areas to focus on
          </Typography>
          <Typography sx={{ mb: 2 }}>
            {priorities.length
              ? 'Review these modules first, starting with your lowest accuracy:'
              : 'No missed questions in this session. Keep practicing across other topics.'}
          </Typography>
          {results.modules.map((m) => (
            <Typography key={m.id}>
              {m.name}: {m.correct}/{m.total} correct ({m.percent}%)
              {m.correct < m.total ? ' — review recommended' : ''}
            </Typography>
          ))}
          <Typography color="text.secondary" variant="body2" sx={{ mt: 2 }}>
            Based only on questions in this session. This practice score does
            not predict an official exam result.
          </Typography>
        </Paper>
        <Typography component="h3" variant="h5">
          Missed questions ({results.missed.length})
        </Typography>
        {results.missed.map((q) => (
          <Paper key={q.questionId} variant="outlined" sx={{ p: 3 }}>
            <Typography color="text.secondary" variant="body2">
              {q.moduleName}
            </Typography>
            <Typography component="h4" variant="h6" sx={{ my: 1 }}>
              {q.prompt}
            </Typography>
            <Typography>
              Your answer: {answerText(q, responses[q.questionId])}
            </Typography>
            <Typography>
              Correct answer: {answerText(q, q.correctChoiceIds)}
            </Typography>
            <Typography sx={{ mt: 1 }}>{q.explanation}</Typography>
          </Paper>
        ))}
        <Box>
          <Button variant="contained" onClick={reset}>
            Set up another {isExam ? 'exam' : 'quiz'}
          </Button>
        </Box>
      </Stack>
    );
  }

  const question = session.questions[index];
  const response = responses[question.questionId] ?? [];
  const checked = locked.includes(question.questionId);
  const answeredCount = session.questions.filter(
    (q) => responses[q.questionId]?.length,
  ).length;
  const expired = () => {
    if (isExam && secondsRemaining(deadline.current) === 0) {
      setTimedOut(true);
      setFinished(true);
      setConfirmFinish(false);
      return true;
    }
    return false;
  };
  function save(ids) {
    if (checked || expired()) return;
    setResponses((old) => ({ ...old, [question.questionId]: ids }));
  }
  function moveQuestion(nextIndex) {
    if (!expired()) setIndex(nextIndex);
  }
  const ordered = response.length
    ? response
    : question.choices.map((c) => c.id);
  const single =
    question.correctChoiceIds.length === 1 &&
    question.questionType !== 'ordering';
  return (
    <Stack spacing={3} sx={{ mt: 3 }}>
      <Stack direction="row" justifyContent="space-between" gap={2}>
        <Typography>
          Question {index + 1} of {session.questions.length}
        </Typography>
        {isExam && (
          <Typography role="timer" aria-label="Time remaining">
            Time remaining: {formatTime(remaining)}
          </Typography>
        )}
      </Stack>
      <LinearProgress
        aria-label="Questions answered"
        variant="determinate"
        value={(answeredCount / session.questions.length) * 100}
      />
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography color="text.secondary" variant="body2">
          {question.moduleName}
        </Typography>
        <Typography
          ref={heading}
          tabIndex={-1}
          component="h2"
          variant="h5"
          sx={{ my: 2 }}
        >
          {question.prompt}
        </Typography>
        {question.questionType === 'ordering' ? (
          <>
            <Typography sx={{ mb: 2 }}>
              Arrange the steps, then confirm the order.
            </Typography>
            <Stack spacing={1}>
              {ordered.map((id, position) => (
                <Stack key={id} direction="row" spacing={1} alignItems="center">
                  <Typography sx={{ flex: 1 }}>
                    {position + 1}.{' '}
                    {question.choices.find((c) => c.id === id).text}
                  </Typography>
                  <Button
                    disabled={checked || position === 0}
                    aria-label={`Move step ${position + 1} up`}
                    onClick={() => {
                      const next = [...ordered];
                      [next[position - 1], next[position]] = [
                        next[position],
                        next[position - 1],
                      ];
                      save(next);
                    }}
                  >
                    Up
                  </Button>
                  <Button
                    disabled={checked || position === ordered.length - 1}
                    aria-label={`Move step ${position + 1} down`}
                    onClick={() => {
                      const next = [...ordered];
                      [next[position + 1], next[position]] = [
                        next[position],
                        next[position + 1],
                      ];
                      save(next);
                    }}
                  >
                    Down
                  </Button>
                </Stack>
              ))}
            </Stack>
            <Button
              disabled={checked}
              onClick={() => save([...ordered])}
              sx={{ mt: 2 }}
            >
              {response.length ? 'Order saved' : 'Confirm order'}
            </Button>
          </>
        ) : (
          <FormControl component="fieldset" fullWidth disabled={checked}>
            <FormLabel component="legend">
              {single
                ? 'Select one answer'
                : `Select ${question.correctChoiceIds.length} answers`}
            </FormLabel>
            {single ? (
              <RadioGroup
                value={response[0] ?? ''}
                onChange={(e) => save([e.target.value])}
              >
                {question.choices.map((c) => (
                  <FormControlLabel
                    key={c.id}
                    value={c.id}
                    control={<Radio />}
                    label={c.text}
                  />
                ))}
              </RadioGroup>
            ) : (
              <FormGroup>
                {question.choices.map((c) => (
                  <FormControlLabel
                    key={c.id}
                    label={c.text}
                    control={
                      <Checkbox
                        checked={response.includes(c.id)}
                        onChange={(e) =>
                          save(
                            e.target.checked
                              ? [...response, c.id]
                              : response.filter((id) => id !== c.id),
                          )
                        }
                      />
                    }
                  />
                ))}
              </FormGroup>
            )}
          </FormControl>
        )}
        {session.instant && !checked && (
          <Button
            sx={{ mt: 2 }}
            variant="contained"
            disabled={!response.length}
            onClick={() => {
              if (!expired()) setLocked((old) => [...old, question.questionId]);
            }}
          >
            Check answer
          </Button>
        )}
        {session.instant && checked && (
          <Alert
            role="status"
            severity={isCorrect(question, response) ? 'success' : 'error'}
            sx={{ mt: 2 }}
          >
            <Typography fontWeight="bold">
              {isCorrect(question, response) ? 'Correct' : 'Incorrect'}
            </Typography>
            <Typography>
              Correct answer: {answerText(question, question.correctChoiceIds)}
            </Typography>
            <Typography>{question.explanation}</Typography>
          </Alert>
        )}
      </Paper>
      <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }} useFlexGap>
        <Button disabled={index === 0} onClick={() => moveQuestion(index - 1)}>
          Previous question
        </Button>
        <Button
          disabled={index === session.questions.length - 1}
          onClick={() => moveQuestion(index + 1)}
        >
          Next question
        </Button>
        <Button
          variant="outlined"
          onClick={() => {
            if (!expired()) setConfirmFinish(true);
          }}
        >
          Finish {isExam ? 'exam' : 'quiz'}
        </Button>
      </Stack>
      <Dialog
        open={confirmFinish}
        onClose={() => setConfirmFinish(false)}
        aria-labelledby="finish-title"
      >
        <DialogTitle id="finish-title">
          Submit {isExam ? 'exam' : 'quiz'}?
        </DialogTitle>
        <DialogContent>
          You answered {answeredCount} of {session.questions.length} questions.
          Unanswered questions count as incorrect. Answers cannot be changed
          after submission.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmFinish(false)}>Keep studying</Button>
          <Button
            variant="contained"
            onClick={() => {
              setConfirmFinish(false);
              if (!expired()) setFinished(true);
            }}
          >
            Submit and view results
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
