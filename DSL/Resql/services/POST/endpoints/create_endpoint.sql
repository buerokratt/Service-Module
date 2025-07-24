INSERT INTO endpoints (
    endpoint_id,
    service_id,
    name,
    type,
    file_name,
    is_common,
    definitions
)
VALUES (
    :endpointId::uuid,
    :serviceId::uuid,
    :name,
    :type::endpoint_type,
    :fileName,
    :isCommon,
    :definitions::jsonb
); 