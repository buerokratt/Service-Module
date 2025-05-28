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
WITH MaxServicesSettings AS (
  SELECT DISTINCT ON (name) id as maxId
  FROM services_settings
  ORDER BY created_at DESC
)
SELECT name, value
FROM services_settings
JOIN MaxServicesSettings ON id = maxId;
