INSERT INTO user_step_preference(steps, endpoints, user_id_code)
VALUES(:steps::step_type[], :endpoints::uuid[], :user_id_code);
