WITH LatestEndpoints AS (
  SELECT DISTINCT ON (e.endpoint_id) e.*
  FROM endpoints AS e
  WHERE (e.service_id = :id::uuid OR e.is_common = true)
  ORDER BY e.endpoint_id, e.id DESC
),
UserPreferences AS (
  SELECT endpoints
  FROM user_step_preference
  WHERE user_id_code = :user_id_code
  ORDER BY created_at DESC
  LIMIT 1
)
SELECT
  le.endpoint_id,
  le.name,
  le.type,
  le.is_common,
  le.definitions
FROM LatestEndpoints AS le
CROSS JOIN UserPreferences AS up
WHERE le.deleted IS FALSE
ORDER BY 
  CASE 
    WHEN up.endpoints IS NULL OR array_length(up.endpoints, 1) = 0 THEN 1
    ELSE array_position(up.endpoints, le.endpoint_id)
  END,
  CASE 
    WHEN up.endpoints IS NULL OR array_length(up.endpoints, 1) = 0 THEN le.id
    ELSE NULL
  END DESC; 