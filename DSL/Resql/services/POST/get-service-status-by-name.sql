SELECT current_state
FROM services
WHERE name = :service_name
  AND NOT deleted
ORDER BY id DESC
LIMIT 1;
