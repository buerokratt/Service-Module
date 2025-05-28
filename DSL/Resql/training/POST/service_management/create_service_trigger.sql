/*
declaration:
  version: 0.1
  description: "Create a new service trigger with specified intent, service ID, status, author role, and service name"
  method: post
  namespace: service_management
  returns: json
  accepts: json
  allowlist:
    query:
      - field: intent
        type: string
        description: "Triggering intent associated with the service"
      - field: serviceId
        type: string
        description: "Identifier of the target service"
      - field: status
        type: string
        enum: ['pending','deleted', 'declined', 'approved']
        description: "Status of the service trigger"
      - field: authorRole
        type: string
        enum: ['backoffice-user', 'end-user', 'Bürokratt', 'buerokratt']
        description: "Role of the author who created the trigger"
      - field: serviceName
        type: string
        description: "Human-readable name of the service"
  response:
    fields: []
*/
INSERT INTO service_trigger (intent, service, status, author_role, service_name)
VALUES (:intent, :serviceId, :status::trigger_status, :authorRole::author_role, :serviceName)
