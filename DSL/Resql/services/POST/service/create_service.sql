/*
declaration:
  version: 0.1
  description: "Create a new service with the specified parameters"
  method: post
  namespace: service
  returns: json
  accepts: json
  allowlist:
    query:
      - field: name
        type: string
        description: "Name of the service"
      - field: description
        type: string
        description: "Description of the service"
      - field: slot
        type: string
        description: "Slot identifier for the service"
      - field: service_id
        type: string
        description: "Unique identifier for the service group"
      - field: ruuter_type
        type: string
        enum: ['GET', 'POST']
        description: "Ruuter request type (cast to enum ruuter_request_type)"
      - field: is_common
        type: boolean
        description: "Indicates if the service is a common service"
      - field: structure
        type: string
        description: "JSON structure defining the service logic and configuration"
  response:
    fields: []
*/
INSERT INTO services.services (
    name, description, slot, service_id, ruuter_type, is_common, structure
)
VALUES (
    :name,
    :description,
    :slot,
    :service_id,
    :ruuter_type::RUUTER_REQUEST_TYPE,
    :is_common,
    :structure::JSON
);
