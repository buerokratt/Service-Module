-- Remove all non-common endpoints of a deleted service from all user step preferences
-- This is called when a service is deleted to clean up references to its endpoints

INSERT INTO user_step_preference (steps, endpoints, user_id_code)
SELECT 
    steps,
    array_remove(endpoints, le.endpoint_id) AS endpoints,
    user_id_code
FROM user_step_preference AS usp1
CROSS JOIN (
    SELECT DISTINCT ON (endpoint_id) endpoint_id
    FROM endpoints
    WHERE service_id = :serviceId::uuid
      AND is_common = FALSE
      AND deleted = FALSE
    ORDER BY endpoint_id, id DESC
) AS le
WHERE usp1.endpoints @> ARRAY[le.endpoint_id]
  AND usp1.created_at = (
    SELECT MAX(created_at) 
    FROM user_step_preference AS usp2 
    WHERE usp2.user_id_code = usp1.user_id_code
  ); 