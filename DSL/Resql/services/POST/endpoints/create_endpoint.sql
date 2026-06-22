INSERT INTO endpoints (
    endpoint_id,
    service_id,
    name,
    type,
    definitions,
    description
)
VALUES (
    :endpointId::uuid,
    NULLIF(:serviceId, '')::uuid,
    :name,
    :type::endpoint_type,
    :definitions::jsonb,
    :description
); 
