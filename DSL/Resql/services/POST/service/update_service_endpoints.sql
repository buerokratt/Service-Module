/*
declaration:
  version: 0.1
  description: "Clone the latest version of a service and override its endpoints with new values"
  method: post
  namespace: service
  returns: json
  accepts: json
  allowlist:
    query:
      - field: id
        type: string
        description: "Service ID of the existing service to clone"
      - field: endpoints
        type: string
        description: "New list of endpoints in JSON format to assign to the cloned service"
  response:
    fields: []
*/
SELECT copy_row_with_modifications(
    'services',
    'id', '', id,
   ARRAY[
        'enpoints', '::JSON', :endpoints,
        'updated_at', '::TIMESTAMP WITH TIME ZONE', NOW()::VARCHAR
   ]::VARCHAR[]
)
FROM services
WHERE service_id = :id
ORDER BY updated_at DESC
LIMIT 1;
