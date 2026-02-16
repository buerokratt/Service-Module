WITH UserPreferences AS (
  SELECT endpoints
  FROM user_step_preference
  WHERE user_id_code = :user_id_code
  ORDER BY created_at DESC
  LIMIT 1
)
SELECT
  e.endpoint_id,
  e.name,
  e.type,
  e.is_common,
  e.definitions
FROM endpoints AS e
CROSS JOIN UserPreferences AS up
WHERE (e.service_id = :id::uuid OR e.is_common = true)
  AND e.deleted IS FALSE
  AND (:search IS NULL OR :search = '' OR LOWER(e.name) LIKE LOWER('%' || :search || '%'))
ORDER BY 
  CASE 
    WHEN up.endpoints IS NULL OR array_length(up.endpoints, 1) = 0 THEN 1
    ELSE array_position(up.endpoints, e.endpoint_id)
  END,
  CASE 
    WHEN up.endpoints IS NULL OR array_length(up.endpoints, 1) = 0 THEN e.id
    ELSE NULL
  END DESC; 
