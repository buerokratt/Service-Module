UPDATE endpoints
SET deleted = TRUE
WHERE service_id = :serviceId::uuid
  AND is_common = FALSE
  AND deleted = FALSE;
