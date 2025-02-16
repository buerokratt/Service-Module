SELECT current_state, ruuter_type FROM services
WHERE service_id = :id
ORDER BY id DESC
LIMIT 1;
