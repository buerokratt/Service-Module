UPDATE endpoints
SET llm_index_status = :status::llm_index_status
WHERE endpoint_id = :endpointId::uuid;
