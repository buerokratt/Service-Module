/*
declaration:
  version: 0.1
  description: "Clone the latest version of a service and override its state"
  method: post
  namespace: auth_users
  returns: json
  allowlist:
    query:
      - field: id
        type: string
        description: "Service ID of the existing service to clone"
      - field: new_state
        type: string
        enum: ['active', 'inactive', 'draft', 'ready']
        description: "New state to assign to the cloned service version"
  response:
    fields: []
*/
SELECT
    COPY_ROW_WITH_MODIFICATIONS(
        'services',
        'id', '', id,
        ARRAY[
            'current_state', '::SERVICE_STATE', :new_state,
            'updated_at', '::TIMESTAMP WITH TIME ZONE', NOW()::VARCHAR
        ]::VARCHAR []
    )
FROM services
WHERE service_id = :id
ORDER BY updated_at DESC
LIMIT 1;
