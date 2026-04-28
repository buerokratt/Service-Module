INSERT INTO endpoints (
    endpoint_id,
    service_id,
    name,
    type,
    is_common,
    definitions,
    description
)
VALUES (
    :endpointId::uuid,
    NULLIF(:serviceId, '')::uuid,
    :name,
    :type::endpoint_type,
    :isCommon,
    :definitions::jsonb,
    :description
); 
