UPDATE services
SET llm_index_status = :status::llm_index_status
WHERE service_id = :serviceId;
