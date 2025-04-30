WITH latest_services AS (
    SELECT DISTINCT ON (service_id) id, name, service_id, structure
    FROM services
    WHERE deleted IS false
    ORDER BY service_id, id DESC
)
SELECT name, service_id
FROM latest_services
WHERE jsonb_path_exists(
        structure::jsonb,
        ('$.**.originalDefinedNodeId ? (@ == "' || :endpoint_id || '")')::jsonpath
      )
  AND (:excluded_service_id::text IS NULL OR service_id != :excluded_service_id);
