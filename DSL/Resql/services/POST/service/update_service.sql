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
SELECT
    COPY_ROW_WITH_MODIFICATIONS(
        'services.services',
        'id', '', id,
        ARRAY[
            'name', '', :name,
            'description', '', :description,
            'slot', '', :slot,
            'structure', '::JSON', :structure,
            'updated_at', '::TIMESTAMP WITH TIME ZONE', NOW()::VARCHAR
        ]::VARCHAR []
    )
FROM services.services
WHERE service_id = :id
ORDER BY updated_at DESC
LIMIT 1;
