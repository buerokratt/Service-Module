UPDATE services
SET needs_training = :training_status
WHERE id = :id
