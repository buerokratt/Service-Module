WITH LatestEndpoints AS (
  SELECT DISTINCT ON (e.endpoint_id) e.*
  FROM endpoints AS e
  WHERE (e.service_id = :id::uuid OR e.is_common = true)
  ORDER BY e.endpoint_id, e.id DESC
)
SELECT
  endpoint_id,
  name,
  type,
  is_common,
  definitions
FROM LatestEndpoints
WHERE deleted IS FALSE
ORDER BY id DESC;
