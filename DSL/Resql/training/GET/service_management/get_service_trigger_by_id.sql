/*
declaration:
  version: 0.1
  description: "Fetch the latest active trigger for a specific service, excluding deleted or declined statuses"
  method: get
  namespace: service_management
  returns: json
  allowlist:
    query:
      - field: serviceId
        type: string
        description: "Identifier of the service whose latest trigger should be retrieved"
  response:
    fields:
      - field: id
        type: number
        description: "Unique identifier of the trigger"
      - field: intent
        type: string
        description: "Triggering intent"
      - field: service
        type: string
        description: "Service identifier associated with the trigger"
      - field: service_name
        type: string
        description: "Name of the service"
      - field: status
        type: string
        description: "Status of the trigger"
      - field: author_role
        type: string
        enum: ['backoffice-user', 'end-user', 'Bürokratt', 'buerokratt']
        description: "Role of the user who created the trigger"
      - field: created
        type: timestamp
        description: "Timestamp when the trigger was created"
*/
SELECT id, intent, service, service_name, status, author_role, created
FROM service_management.service_trigger
WHERE service = :serviceId
  AND id = (
    SELECT MAX(id)
    FROM service_management.service_trigger
    WHERE service = :serviceId
  )
  AND status NOT IN ('deleted', 'declined');
