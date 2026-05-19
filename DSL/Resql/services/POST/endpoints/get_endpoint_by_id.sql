WITH selected AS (
  SELECT def
  FROM endpoints AS e,
       jsonb_array_elements(e.definitions) AS def
  WHERE e.endpoint_id = :endpointId::uuid
    AND e.deleted IS FALSE
    AND (def->>'isSelected')::boolean = true
  LIMIT 1
)
SELECT
  e.endpoint_id,
  e.name,
  e.description,
  COALESCE(
    (SELECT COALESCE(def->>'url', def->>'openApiUrl', def->>'path', '') FROM selected),
    COALESCE(
      e.definitions->0->>'url',
      e.definitions->0->>'openApiUrl',
      e.definitions->0->>'path',
      ''
    )
  ) AS selected_url,
  COALESCE(
    (SELECT def->>'methodType' FROM selected),
    e.definitions->0->>'methodType',
    'GET'
  ) AS selected_method,
  COALESCE(
    (SELECT (def->'params'->'variables')::text FROM selected),
    (e.definitions->0->'params'->'variables')::text,
    '[]'
  ) AS selected_params
FROM endpoints AS e
WHERE e.endpoint_id = :endpointId::uuid
  AND e.deleted IS FALSE;
