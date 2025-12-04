-- Remove all non-common endpoints of a deleted service from all user step preferences
-- This is called when a service is deleted to clean up references to its endpoints

UPDATE user_step_preference AS usp
SET endpoints = COALESCE((
    SELECT array_agg(endpoint_id)::uuid[]
    FROM unnest(usp.endpoints) AS endpoint_id
    WHERE endpoint_id NOT IN (
        SELECT DISTINCT ON (endpoint_id) endpoint_id
        FROM endpoints
        WHERE service_id = :serviceId::uuid
          AND is_common = FALSE
          AND deleted = FALSE
        ORDER BY endpoint_id, id DESC
    )
), ARRAY[]::uuid[])
WHERE EXISTS (
    SELECT 1
    FROM unnest(usp.endpoints) AS endpoint_id
    WHERE endpoint_id IN (
        SELECT DISTINCT ON (endpoint_id) endpoint_id
        FROM endpoints
        WHERE service_id = :serviceId::uuid
          AND is_common = FALSE
          AND deleted = FALSE
        ORDER BY endpoint_id, id DESC
    )
)
  AND usp.created_at = (
    SELECT MAX(created_at)
    FROM user_step_preference AS usp2
    WHERE usp2.user_id_code = usp.user_id_code
  ); 