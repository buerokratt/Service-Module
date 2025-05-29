/*
declaration:
  version: 0.1
  description: "Fetch the current state and Ruuter type of the latest service version by service_id"
  method: get
  namespace: service
  returns: json
  allowlist:
    query:
      - field: id
        type: string
        description: "Service identifier used to retrieve the latest service metadata"
  response:
    fields:
      - field: current_state
        type: string
        description: "Current state of the most recent service version"
      - field: ruuter_type
        type: string
        enum: ['GET', 'POST']
        description: "Ruuter type associated with the most recent service version"
*/
SELECT
    current_state,
    ruuter_type
FROM services
WHERE service_id = :id
ORDER BY updated_at DESC
LIMIT 1;
