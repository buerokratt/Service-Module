INSERT INTO endpoints (
    endpoint_id,
    service_ids,
    name,
    type,
    file_name,
    is_common,
    definitions
)
VALUES (
    :endpointId::uuid,
    CASE
      -- Common endpoints are not linked to any services initially
      -- They are linked with services when enpoints are added to the flow structure 
      WHEN :isCommon IS TRUE THEN ARRAY[]::uuid[]
      ELSE ARRAY[:serviceId::uuid]
    END,
    :name,
    :type::endpoint_type,
    :fileName,
    :isCommon,
    :definitions::jsonb
); 