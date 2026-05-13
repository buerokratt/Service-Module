UPDATE endpoints
SET
    service_id = NULLIF(:serviceId, '')::uuid,
    name = :name,
    type = :type::endpoint_type,
    is_common = :isCommon,
    definitions = :definitions::jsonb,
    description = :description
WHERE endpoint_id = :endpointId::uuid;
