/*
declaration:
  version: 0.1
  description: "Fetch the most recent service name by service_id"
  method: get
  namespace: service
  returns: json
  allowlist:
    query:
      - field: id
        type: string
        description: "Service identifier used to look up the latest service name"
  response:
    fields:
      - field: name
        type: string
        description: "Name of the most recent service with the given service_id"
*/
SELECT name FROM services
WHERE service_id = :id
ORDER BY id DESC
LIMIT 1;
