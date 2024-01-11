SELECT id,
  name,
  current_state AS state,
  ruuter_type AS type,
  is_common AS isCommon,
  structure::json,
  endpoints::json,
  description
FROM services
WHERE deleted = false AND id = cast(:id as int);
