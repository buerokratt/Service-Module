WITH latest_endpoints AS (
    SELECT DISTINCT ON (endpoint_id) *
    FROM endpoints
    WHERE
        service_ids @> ARRAY[:serviceId::uuid]
        AND is_common = FALSE
        AND deleted = FALSE
    ORDER BY endpoint_id, id DESC
)
INSERT INTO endpoints (
    endpoint_id,
    service_ids,
    name,
    type,
    file_name,
    is_common,
    definitions,
    deleted,
    created_at,
    updated_at
)
SELECT
    endpoint_id,
    service_ids,
    name,
    type,
    file_name,
    is_common,
    definitions,
    TRUE AS deleted,
    created_at,
    updated_at
FROM latest_endpoints;
