INSERT INTO endpoints (
    id,
    service_ids,
    name,
    type,
    file_name,
    is_common,
    definitions
)
VALUES (
    :id::uuid,
    ARRAY[:serviceId::uuid],
    :name,
    :type::endpoint_type,
    :fileName,
    :isCommon,
    :definitions::jsonb
); 