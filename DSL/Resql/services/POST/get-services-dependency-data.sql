SELECT
  service_id,
  name,
  current_state AS state,
  is_common,
  structure::json
FROM services
WHERE NOT deleted
ORDER BY name ASC;
