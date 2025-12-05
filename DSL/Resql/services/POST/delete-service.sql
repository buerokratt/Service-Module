UPDATE services
SET deleted = TRUE
WHERE service_id = :id;
