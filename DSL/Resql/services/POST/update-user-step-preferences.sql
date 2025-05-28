INSERT INTO user_step_preference(step, "ordinality", active, user_id_code)
VALUES(:step::step_type, :ordinality, :active, :user_id_code);
