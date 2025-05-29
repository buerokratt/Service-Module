/*
declaration:
  version: 0.1
  description: "Retrieve the latest value for each unique service setting name"
  method: get
  namespace: service
  returns: json
  allowlist:
    query: []
  response:
    fields:
      - field: name
        type: string
        description: "Setting name"
      - field: value
        type: string
        description: "Most recent value associated with the setting name"
*/
WITH
    max_services_settings AS (
        SELECT DISTINCT ON (name) id AS max_id
        FROM services_settings
        ORDER BY name ASC, created_at DESC
    )

SELECT
    name,
    value
FROM services_settings
    INNER JOIN max_services_settings ON id = max_id;
