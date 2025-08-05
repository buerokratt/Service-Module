-- Remove a specific endpoint from all user step preferences
-- This is called when an endpoint is deleted to clean up references

INSERT INTO user_step_preference (steps, endpoints, user_id_code)
SELECT 
    steps,
    array_remove(endpoints, :endpoint_id::uuid) AS endpoints,
    user_id_code
FROM user_step_preference AS usp1
WHERE endpoints @> ARRAY[:endpoint_id::uuid]
  AND created_at = (
    SELECT MAX(created_at) 
    FROM user_step_preference AS usp2 
    WHERE usp2.user_id_code = usp1.user_id_code
  ); 