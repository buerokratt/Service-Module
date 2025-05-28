/*
declaration:
  version: 0.1
  description: "Create a deleted copy of the latest service version for a given service_id"
  method: post
  namespace: service
  returns: json
  accepts: json
  allowlist:
    query:
      - field: id
        type: string
        description: "Service ID for which the latest version should be duplicated and marked as deleted"
  response:
    fields: []
*/
INSERT INTO services (name, description, slot, created_at, updated_at, ruuter_type, current_state, service_id, is_common, deleted, structure, endpoints)
SELECT 
  name,
  description,
  slot,
  created_at,
  updated_at,
  ruuter_type,
  current_state,
  service_id,
  is_common,
  TRUE AS deleted,
  structure,
  endpoints
FROM services
WHERE service_id = :id
ORDER BY id DESC
LIMIT 1;
