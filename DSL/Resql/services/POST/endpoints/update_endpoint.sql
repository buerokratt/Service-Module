UPDATE endpoints
SET
    service_id = :serviceId::uuid,
    name = :name,
    type = :type::endpoint_type,
    is_common = :isCommon,
    definitions = :definitions::jsonb
WHERE endpoint_id = :endpointId::uuid;
