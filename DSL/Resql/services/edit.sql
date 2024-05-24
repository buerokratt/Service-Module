INSERT INTO services (name, description, ruuter_type, current_state, service_id, is_common, structure, endpoints)
SELECT
  :name,
  :description,
  ruuter_type,
  current_state,
  service_id,
  is_common,
  :structure::json,
  endpoints
FROM services
WHERE service_id = :id
ORDER BY id DESC
LIMIT 1;
