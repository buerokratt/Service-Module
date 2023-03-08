UPDATE services
SET is_active = :is_active
WHERE id = :id AND ruuter_type = :ruuter_type
