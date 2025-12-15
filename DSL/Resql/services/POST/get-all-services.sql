SELECT DISTINCT ON (service_id)
  name,
  service_id,
  structure::json
FROM services
WHERE NOT deleted
ORDER BY service_id, id DESC;

