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
  current_state AS state,
  ruuter_type AS type,
  is_common AS isCommon,
  structure::json,
  subquery.endpoints::json AS endpoints,
  service_id
FROM services
JOIN MaxService ON id = maxId
JOIN (
  SELECT jsonb_agg(endpoint) AS endpoints
  FROM (
    SELECT DISTINCT endpoint
    FROM (
      SELECT endpoint::jsonb
      FROM services, json_array_elements(endpoints) AS endpoint
      WHERE (endpoint->>'isCommon')::boolean = true
      UNION
      SELECT endpoint::jsonb
      FROM services, json_array_elements(endpoints) AS endpoint, MaxService
      WHERE id = maxId
    ) AS combined_endpoints
  ) subquery
) subquery ON true
WHERE NOT deleted 
ORDER BY id ASC;
