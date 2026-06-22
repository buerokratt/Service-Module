UPDATE endpoints
SET deleted = TRUE
WHERE service_id = :serviceId::uuid
  AND deleted = FALSE;
