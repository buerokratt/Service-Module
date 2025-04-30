SELECT DISTINCT ON (service_id) name, service_id
FROM services s1
WHERE jsonb_path_exists(
        structure::jsonb,
        ('$.**.originalDefinedNodeId ? (@ == "' || :endpoint_id || '")')::jsonpath
      )
  AND (:excluded_service_id::text IS NULL OR service_id != :excluded_service_id)
  AND NOT EXISTS (
    SELECT 1 FROM services s2 
    WHERE s2.service_id = s1.service_id 
    AND s2.deleted IS false
  )
ORDER BY service_id, id DESC;
