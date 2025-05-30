/*
declaration:
  version: 0.1
  description: "Create a new service setting with a specified name and value"
  method: post
  namespace: service
  returns: json
  accepts: json
  allowlist:
    query:
      - field: name
        type: string
        description: "Name of the service setting"
      - field: value
        type: string
        description: "Value of the service setting"
  response:
    fields: []
*/
INSERT INTO services.services_settings (name, value)
VALUES (:name, :value);
