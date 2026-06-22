UPDATE endpoints
SET deleted = TRUE
WHERE endpoint_id = :id::uuid;
