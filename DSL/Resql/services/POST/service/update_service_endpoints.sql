/*
declaration:
  version: 0.1
  description: "Clone the latest version of a service and override its endpoints with new values"
  method: post
  namespace: service
  returns: json
  accepts: json
  allowlist:
    query:
      - field: id
        type: string
        description: "Service ID of the existing service to clone"
      - field: endpoints
        type: string
        description: "New list of endpoints in JSON format to assign to the cloned service"
  response:
    fields: []
*/
INSERT INTO services (name, description, slot, ruuter_type, current_state, service_id, is_common, structure, endpoints)
SELECT
  name,
  description,
  slot,
  ruuter_type,
  current_state,
  service_id,
  is_common,
  structure,
  :endpoints::json
FROM services
WHERE service_id = :id
ORDER BY id DESC
LIMIT 1;
