UPDATE endpoints
SET is_llm_synced = :status::boolean
WHERE endpoint_id = :endpointId::uuid;
