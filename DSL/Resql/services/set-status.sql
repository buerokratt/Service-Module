UPDATE services
SET current_state = :new_state::service_state
WHERE id = :id
