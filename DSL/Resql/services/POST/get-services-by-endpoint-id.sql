SELECT DISTINCT ON (service_id) name, service_id
FROM services
WHERE jsonb_path_exists(
        structure::jsonb,
        ('$.**.originalDefinedNodeId ? (@ == "' || :endpoint_id || '")')::jsonpath
      )
  AND (:excluded_service_id::text IS NULL OR service_id != :excluded_service_id)
  AND deleted IS false
ORDER BY service_id, id DESC;
