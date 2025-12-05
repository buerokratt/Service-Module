SELECT steps, endpoints
FROM user_step_preference
WHERE user_id_code = :user_id_code;
