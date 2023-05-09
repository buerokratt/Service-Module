SELECT id,
  name,
  current_state AS state,
  ruuter_type AS type
FROM services
ORDER BY id;
