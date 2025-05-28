WITH steps AS (
  SELECT unnest(ARRAY[
    'assign',
    'textfield',
    'condition',
    'finishing-step-end',
    'input',
    'auth',
    'open-webpage',
    'file-generate',
    'file-sign',
    'finising-step-redirect',
    'rasa-rules',
    'siga'
  ]) AS step,
    unnest(ARRAY[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]) AS step_order,
    unnest(ARRAY[true, true, true, true, false, false, false, false, false, false, false, false]) AS is_pinned,
    unnest(ARRAY[true, true, true, true, true, true, true, true, true, true, true, false]) AS is_active
)
INSERT INTO user_step_preference (user_id_code, step, "ordinality", pinned, active)
SELECT
  :user_id_code,
  step::step_type,
  step_order::integer,
  is_pinned::boolean,
  is_active::boolean
FROM steps;
