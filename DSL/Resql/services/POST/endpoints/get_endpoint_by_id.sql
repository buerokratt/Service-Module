SELECT
  e.endpoint_id,
  e.name,
  e.description,
  COALESCE(
    (
      SELECT COALESCE(def->>'url', def->>'openApiUrl', def->>'path', '')
      FROM jsonb_array_elements(e.definitions) AS def
      WHERE (def->>'isSelected')::boolean = true
      LIMIT 1
    ),
    COALESCE(
      e.definitions->0->>'url',
      e.definitions->0->>'openApiUrl',
      e.definitions->0->>'path',
      ''
    )
  ) AS selected_url,
  COALESCE(
    (
      SELECT def->>'methodType'
      FROM jsonb_array_elements(e.definitions) AS def
      WHERE (def->>'isSelected')::boolean = true
      LIMIT 1
    ),
    e.definitions->0->>'methodType',
    'GET'
  ) AS selected_method,
  COALESCE(
    (
      SELECT (def->'params'->'variables')::text
      FROM jsonb_array_elements(e.definitions) AS def
      WHERE (def->>'isSelected')::boolean = true
      LIMIT 1
    ),
    (e.definitions->0->'params'->'variables')::text,
    '[]'
  ) AS selected_params
FROM endpoints AS e
WHERE e.endpoint_id = :endpointId::uuid
  AND e.deleted IS FALSE;
