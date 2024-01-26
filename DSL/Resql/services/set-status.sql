UPDATE services
SET current_state = :new_state::service_state
WHERE service_id = :id
