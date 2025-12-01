SELECT name FROM services
WHERE service_id = :id
ORDER BY id DESC
LIMIT 1;
