/*
declaration:
  version: 0.1
  description: "Fetch the latest non-deleted configuration value for a specified key"
  method: get
  namespace: config
  returns: json
  allowlist:
    query:
      - field: key
        type: string
        description: "Configuration key to retrieve the latest value for"
  response:
    fields:
      - field: id
        type: string
        description: "Unique identifier of the configuration entry"
      - field: key
        type: string
        description: "Key of the configuration setting"
      - field: value
        type: string
        description: "Stored value associated with the key"
      - field: created
        type: timestamp
        description: "Timestamp when the configuration entry was created"
*/
SELECT id, key, value, created
FROM configuration
WHERE key=:key
AND id IN (SELECT max(id) from configuration GROUP BY key)
AND NOT deleted;
