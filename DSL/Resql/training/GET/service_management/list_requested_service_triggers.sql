/*
declaration:
  version: 0.1
  description: "Fetch paginated and sorted list of pending service trigger requests, excluding those from service_manager role"
  method: get
  namespace: service_management
  returns: json
  allowlist:
    query:
      - field: page
        type: number
        description: "Current page number (1-based index)"
      - field: page_size
        type: number
        description: "Number of items per page"
      - field: sorting
        type: string
        enum: ['intent asc', 'intent desc', 'serviceName asc', 'serviceName desc', 'requestedAt asc', 'requestedAt desc']
        description: "Sorting criteria for the result set"
  response:
    fields:
      - field: intent
        type: string
        description: "Triggering intent"
      - field: service
        type: string
        description: "Service identifier associated with the trigger"
      - field: service_name
        type: string
        description: "Name of the service"
      - field: requested_at
        type: timestamp
        description: "Timestamp of the latest trigger request"
      - field: author_role
        type: string
        enum: ['backoffice-user', 'end-user', 'Bürokratt', 'buerokratt']
        description: "Role of the author who submitted the trigger"
      - field: total_pages
        type: number
        description: "Total number of pages based on the given page size"
*/
SELECT intent,
       service,
       MAX(service_name) AS service_name,
       MAX(created) AS requested_at,
       MAX(author_role) as author_role,
       CEIL(COUNT(*) OVER() / :page_size::DECIMAL) AS total_pages
FROM service_management.service_trigger
GROUP BY intent,
         service    
HAVING MAX(status) = 'pending'
AND MAX("author_role") != 'service_manager'
ORDER BY 
   CASE WHEN :sorting = 'intent asc' THEN intent END ASC,
   CASE WHEN :sorting = 'intent desc' THEN intent END DESC,
   CASE WHEN :sorting = 'serviceName asc' THEN MAX(service_name) END ASC,
   CASE WHEN :sorting = 'serviceName desc' THEN MAX(service_name) END DESC,
   CASE WHEN :sorting = 'requestedAt asc' THEN MAX(created) END ASC,
   CASE WHEN :sorting = 'requestedAt desc' THEN MAX(created) END DESC
OFFSET ((GREATEST(:page::INTEGER, 1) - 1) * :page_size::INTEGER) LIMIT :page_size::INTEGER;
