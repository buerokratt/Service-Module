WITH MaxService AS (
  SELECT MAX(id) AS maxId
  FROM services
  WHERE service_id = :id
  LIMIT 1
)
SELECT
  id,
  name,
  description,  
  slot,
  current_state AS state,
  ruuter_type AS type,
  is_common AS isCommon,
  structure::json,
  service_id
FROM services
JOIN MaxService ON id = maxId
WHERE NOT deleted
ORDER BY id ASC;
