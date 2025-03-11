INSERT INTO services (name, description, slot, ruuter_type, current_state, service_id, is_common, structure, endpoints)
SELECT
  name,
  description,
  slot,
  ruuter_type,
  current_state,
  service_id,
  is_common,
  structure,
  :endpoints::json
FROM services
WHERE service_id = :id
ORDER BY id DESC
LIMIT 1;
