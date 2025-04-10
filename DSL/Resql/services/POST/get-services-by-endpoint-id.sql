SELECT DISTINCT ON (service_id) name, service_id
FROM services
WHERE jsonb_path_exists(
        structure::jsonb,
        ('$.**.originalDefinedNodeId ? (@ == "' || :endpoint_id || '")')::jsonpath
      )
  AND service_id != :service_id
ORDER BY service_id, id DESC;
