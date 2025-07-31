WITH latest_endpoints AS (
    SELECT DISTINCT ON (endpoint_id) *
    FROM endpoints
    WHERE
        service_id = :serviceId::uuid
        AND is_common = FALSE
        AND deleted = FALSE
    ORDER BY endpoint_id, id DESC
)
INSERT INTO endpoints (
    endpoint_id,
    service_id,
    name,
    type,
    is_common,
    definitions,
    deleted,
    created_at,
    updated_at
)
SELECT
    endpoint_id,
    service_id,
    name,
    type,
    is_common,
    definitions,
    TRUE AS deleted,
    created_at,
    updated_at
FROM latest_endpoints;
