SELECT id,
  name,
  current_state AS state,
  ruuter_type AS type,
  is_common AS isCommon,
  structure
FROM services
ORDER BY id;
