SELECT steps
FROM user_step_preference
WHERE user_id_code = :user_id_code
ORDER BY created_at DESC
LIMIT 1;
