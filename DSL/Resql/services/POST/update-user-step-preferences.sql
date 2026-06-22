UPDATE user_step_preference
SET
    steps = :steps::step_type[]
WHERE user_id_code = :user_id_code;
