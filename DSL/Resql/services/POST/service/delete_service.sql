/*
declaration:
  version: 0.1
  description: "Create a deleted copy of the latest service version for a given service_id"
  method: post
  namespace: service
  returns: json
  accepts: json
  allowlist:
    query:
      - field: id
        type: string
        description: "Service ID for which the latest version should be duplicated and marked as deleted"
  response:
    fields: []
*/
SELECT
    COPY_ROW_WITH_MODIFICATIONS(
        'services.services',
        'id', '', id,
        ARRAY[
            'deleted', '::BOOLEAN', 'true',
            'updated_at', '::TIMESTAMP WITH TIME ZONE', NOW()::VARCHAR
        ]::VARCHAR []
    )
FROM services.services
WHERE service_id = :id
ORDER BY updated_at DESC
LIMIT 1;
