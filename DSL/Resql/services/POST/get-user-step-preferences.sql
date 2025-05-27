SELECT DISTINCT ON (step)
  step,
  "ordinality",
  pinned,
  active
FROM user_step_preference
WHERE user_id_code = :user_id_code
ORDER BY step, id DESC, "ordinality" ASC;
