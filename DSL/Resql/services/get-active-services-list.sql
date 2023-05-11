
SELECT id,
  name,
  current_state AS state,
  ruuter_type AS type
FROM services
WHERE current_state = 'active'
ORDER BY id;
