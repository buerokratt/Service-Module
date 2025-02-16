INSERT INTO services (name, description, created_at, updated_at, ruuter_type, current_state, service_id, is_common, deleted, structure, endpoints)
SELECT 
  name,
  description,
  created_at,
  updated_at,
  ruuter_type,
  current_state,
  service_id,
  is_common,
  TRUE AS deleted,
  structure,
  endpoints
FROM services
WHERE service_id = :id
ORDER BY id DESC
LIMIT 1;
