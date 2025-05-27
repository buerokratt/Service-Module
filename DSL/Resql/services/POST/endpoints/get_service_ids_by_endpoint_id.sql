SELECT service_ids
FROM endpoints
WHERE endpoint_id = :endpointId
  AND deleted IS FALSE
ORDER BY id DESC
LIMIT 1;