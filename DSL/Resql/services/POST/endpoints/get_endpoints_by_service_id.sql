WITH LatestEndpoints AS (
  SELECT DISTINCT ON (e.id) e.*
  FROM endpoints AS e
  WHERE (e.service_ids @> ARRAY[:id]::uuid[] OR e.is_common = true)
    AND NOT e.deleted
  ORDER BY e.id, e.created_at DESC
)
SELECT
  endpoint_id,
  name,
  type,
  file_name,
  is_common,
  definitions
FROM LatestEndpoints
ORDER BY created_at DESC;
