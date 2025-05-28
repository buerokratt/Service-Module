/*
declaration:
  version: 0.1
  description: "Fetch the most recent approved trigger entries for each unique combination of intent, service, and service name"
  method: get
  namespace: service_management
  returns: json
  allowlist:
    query: []
  response:
    fields:
      - field: intent
        type: string
        description: "Triggering intent"
      - field: service
        type: string
        description: "Service identifier associated with the trigger"
      - field: created
        type: timestamp
        description: "Timestamp when the trigger was created"
*/
SELECT intent,
       service,
       created
FROM service_trigger
WHERE (intent,
       service,
       service_name,
       created) IN
    (SELECT intent,
            service,
            service_name,
            max(created)
     FROM service_trigger
     GROUP BY intent,
              service,
              service_name)
  AND status in ('approved')
