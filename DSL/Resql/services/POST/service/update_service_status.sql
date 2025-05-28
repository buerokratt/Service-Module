/*
declaration:
  version: 0.1
  description: "Clone the latest version of a service and override its state"
  method: post
  namespace: auth_users
  returns: json
  allowlist:
    query:
      - field: id
        type: string
        description: "Service ID of the existing service to clone"
      - field: new_state
        type: string
        enum: ['active', 'inactive', 'draft', 'ready']
        description: "New state to assign to the cloned service version"
  response:
    fields: []
*/
INSERT INTO services (name, description, slot, ruuter_type, current_state, service_id, is_common, structure, endpoints)
SELECT
  name,
  description,
  slot,
  ruuter_type,
  :new_state::service_state,
  service_id,
  is_common,
  structure,
  endpoints
FROM services
WHERE service_id = :id
ORDER BY id DESC
LIMIT 1;
