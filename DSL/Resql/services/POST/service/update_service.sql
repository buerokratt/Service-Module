/*
declaration:
  version: 0.1
  description: "Create a new version of a service by copying metadata from the latest version and overriding selected fields"
  method: post
  namespace: service
  returns: json
  accepts: json
  allowlist:
    query:
      - field: id
        type: string
        description: "Service ID of the existing service to clone"
      - field: name
        type: string
        description: "New name for the cloned service version"
      - field: description
        type: string
        description: "New description for the cloned service version"
      - field: slot
        type: string
        description: "Slot to assign to the new service version"
      - field: structure
        type: string
        description: "New JSON structure for the service definition"
  response:
    fields: []
*/
INSERT INTO services (name, description, slot, ruuter_type, current_state, service_id, is_common, structure, endpoints)
SELECT
  :name,
  :description,
  :slot,
  ruuter_type,
  current_state,
  service_id,
  is_common,
  :structure::json,
  endpoints
FROM services
WHERE service_id = :id
ORDER BY id DESC
LIMIT 1;
