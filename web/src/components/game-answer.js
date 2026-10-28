'use client';

import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from '@mui/material';

export default function GameAnswer({ question, response, onChange, disabled }) {
  if (question.questionType === 'ordering') {
    const ordered = response.length
      ? response
      : question.choices.map((c) => c.id);
    function move(position, direction) {
      const next = [...ordered];
      [next[position], next[position + direction]] = [
        next[position + direction],
        next[position],
      ];
      onChange(next);
    }
    return (
      <Stack spacing={1}>
        <Typography>Arrange the steps, then confirm the order.</Typography>
        {ordered.map((id, position) => (
          <Stack key={id} direction="row" alignItems="center" spacing={1}>
            <Typography sx={{ flex: 1, minWidth: 0 }}>
              {position + 1}. {question.choices.find((c) => c.id === id).text}
            </Typography>
            <Button
              disabled={disabled || position === 0}
              aria-label={`Move step ${position + 1} up`}
              onClick={() => move(position, -1)}
            >
              Up
            </Button>
            <Button
              disabled={disabled || position === ordered.length - 1}
              aria-label={`Move step ${position + 1} down`}
              onClick={() => move(position, 1)}
            >
              Down
            </Button>
          </Stack>
        ))}
        <Button disabled={disabled} onClick={() => onChange([...ordered])}>
          {response.length ? 'Order saved' : 'Confirm order'}
        </Button>
      </Stack>
    );
  }
  const single = question.correctChoiceIds.length === 1;
  return (
    <FormControl component="fieldset" fullWidth disabled={disabled}>
      <FormLabel component="legend">
        {single
          ? 'Select one answer'
          : `Select ${question.correctChoiceIds.length} answers`}
      </FormLabel>
      {single ? (
        <RadioGroup
          value={response[0] ?? ''}
          onChange={(e) => onChange([e.target.value])}
        >
          {question.choices.map((choice) => (
            <FormControlLabel
              key={choice.id}
              value={choice.id}
              control={<Radio />}
              label={choice.text}
            />
          ))}
        </RadioGroup>
      ) : (
        <FormGroup>
          {question.choices.map((choice) => (
            <FormControlLabel
              key={choice.id}
              label={choice.text}
              control={
                <Checkbox
                  checked={response.includes(choice.id)}
                  onChange={(e) =>
                    onChange(
                      e.target.checked
                        ? [...response, choice.id]
                        : response.filter((id) => id !== choice.id),
                    )
                  }
                />
              }
            />
          ))}
        </FormGroup>
      )}
    </FormControl>
  );
}
