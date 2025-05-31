/*
declaration:
  version: 0.1
  description: "Retrieve all active services with their ID, name, state, and Ruuter type"
  method: get
  namespace: service
  returns: json
  allowlist:
    query: []
  response:
    fields:
      - field: id
        type: string
        description: "Unique identifier of the service"
      - field: name
        type: string
        description: "Name of the active service"
      - field: state
        type: string
        enum: ['active', 'inactive', 'draft', 'ready']
        description: "Current state of the service (expected to be 'active')"
      - field: type
        type: string
        enum: ['GET', 'POST']
        description: "Ruuter type associated with the service"
*/
SELECT
    id,
    name,
    current_state AS state,
    ruuter_type AS type
FROM services.services
WHERE current_state = 'active'
ORDER BY updated_at ASC;
