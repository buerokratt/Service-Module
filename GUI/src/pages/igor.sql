
-- todo return conflicting and show as links
SELECT DISTINCT ON (service_id) name, service_id
FROM services
WHERE jsonb_path_exists(
        structure::jsonb,
        '$.**.originalDefinedNodeId ? (@ == "bfef3b94-2008-4ac7-b768-06ef01af3940")'
      )
  AND service_id != 'f9e239ae-db08-45ab-87ec-c0bf7ed713a1'
ORDER BY service_id, id DESC;

-- todo for deletion - add params
INSERT INTO services (
    name,
    description,
    created_at,
    updated_at,
    ruuter_type,
    current_state,
    service_id,
    is_common,
    deleted,
    structure,
    endpoints,
    slot
)
SELECT
    name,
    description,
    NOW() as created_at,
    NOW() as updated_at,
    ruuter_type,
    current_state,
    service_id,
    is_common,
    deleted,
    structure,
    COALESCE(
        (
            SELECT jsonb_agg(endpoint)
            FROM jsonb_array_elements(endpoints::jsonb) endpoint
            WHERE endpoint->>'id' != 'bfef3b94-2008-4ac7-b768-06ef01af3940'
        ),
        '[]'::jsonb
    ) as endpoints,
    slot
FROM services
WHERE service_id = 'f9e239ae-db08-45ab-87ec-c0bf7ed713a1'
ORDER BY id DESC
LIMIT 1;