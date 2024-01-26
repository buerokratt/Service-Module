SELECT id,
  name,
  current_state AS state,
  ruuter_type AS type,
  is_common AS isCommon,
  structure::json,
  endpoints::json,
  service_id
FROM services
ORDER BY id;
