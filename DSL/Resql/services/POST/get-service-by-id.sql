SELECT
  id,
  name,
  description,
  slot,
  examples,
  entities,
  current_state AS state,
  ruuter_type AS type,
  is_common,
  structure::json,
  service_id
FROM services
WHERE service_id = :id
  AND NOT deleted;
