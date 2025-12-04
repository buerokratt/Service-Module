SELECT
  endpoint_id,
  name,
  type,
  is_common,
  definitions
FROM endpoints
WHERE is_common = true
  AND deleted IS FALSE
ORDER BY id DESC;
