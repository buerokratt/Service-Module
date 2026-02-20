UPDATE user_step_preference
SET
    steps = :steps::step_type[],
    endpoints = :endpoints::uuid[]
WHERE user_id_code = :user_id_code;