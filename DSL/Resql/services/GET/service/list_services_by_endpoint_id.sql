/*
declaration:
  version: 0.1
  description: "Find latest non-deleted services whose structure contains the given endpoint ID, optionally excluding a specific service ID"
  method: get
  namespace: service
  returns: json
  allowlist:
    query:
      - field: endpoint_id
        type: string
        description: "Node ID to search for inside the service's structure"
      - field: excluded_service_id
        type: string
        description: "Optional service ID to exclude from results"
  response:
    fields:
      - field: name
        type: string
        description: "Name of the service that matches the criteria"
      - field: service_id
        type: string
        description: "Service identifier"
*/
WITH
    latest_services AS (
        SELECT DISTINCT ON (service_id)
            name,
            service_id,
            structure
        FROM services
        WHERE deleted IS false
        ORDER BY service_id ASC, updated_at DESC
    )

SELECT
    name,
    service_id
FROM latest_services
WHERE JSONB_PATH_EXISTS(
    structure::JSONB,
    ('$.**.originalDefinedNodeId ? (@ == "' || :endpoint_id || '")')::JSONPATH
)
AND (:excluded_service_id::TEXT IS null OR service_id != :excluded_service_id);
