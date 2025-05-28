/*
declaration:
  version: 0.1
  description: "Retrieve the latest non-deleted service configuration by service_id, including both common and specific endpoints"
  method: get
  namespace: service
  returns: json
  allowlist:
    query:
      - field: id
        type: string
        description: "Service identifier used to fetch the latest version of a service"
  response:
    fields:
      - field: id
        type: string
        description: "Unique identifier of the service record"
      - field: name
        type: string
        description: "Name of the service"
      - field: description
        type: string
        description: "Service description"
      - field: slot
        type: string
        description: "Slot type of the service"
      - field: state
        type: string
        enum: ['active', 'inactive', 'draft', 'ready']
        description: "Current state of the service"
      - field: type
        type: string
        enum: ['GET', 'POST']
        description: "Ruuter type associated with the service"
      - field: isCommon
        type: boolean
        description: "Indicates whether the service is common"
      - field: structure
        type: object
        description: "JSON structure defining the service"
      - field: endpoints
        type: array
        description: "Combined list of common and service-specific endpoints in JSON format"
      - field: service_id
        type: string
        description: "Identifier linking this service to its group"
*/
WITH MaxService AS (
  SELECT id AS maxId
  FROM services
  WHERE service_id = :id
  ORDER BY updated_at DESC
  LIMIT 1
)
SELECT
  id,
  name,
  description,
  slot,
  current_state AS state,
  ruuter_type AS type,
  is_common AS isCommon,
  structure::json,
  subquery.endpoints::json AS endpoints,
  service_id
FROM services
JOIN MaxService ON id = maxId
JOIN (
  SELECT jsonb_agg(endpoint) AS endpoints
  FROM (
    SELECT DISTINCT endpoint
    FROM (
      SELECT endpoint::jsonb
      FROM services, json_array_elements(endpoints) AS endpoint
      WHERE (endpoint->>'isCommon')::boolean = true
      UNION
      SELECT endpoint::jsonb
      FROM services, json_array_elements(endpoints) AS endpoint, MaxService
      WHERE id = maxId
    ) AS combined_endpoints
  ) subquery
) subquery ON true
WHERE NOT deleted
ORDER BY updated_at ASC;
