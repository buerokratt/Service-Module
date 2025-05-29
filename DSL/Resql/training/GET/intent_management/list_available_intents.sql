/*
declaration:
  version: 0.1
  description: "Fetch paginated and sorted list of service-compatible intents not yet connected to any pending or approved service trigger"
  method: get
  namespace: intent_management
  returns: json
  allowlist:
    query:
      - field: page
        type: number
        description: "Current page number (1-based)"
      - field: page_size
        type: number
        description: "Number of items per page"
      - field: sorting
        type: string
        enum: ['intent asc', 'intent desc']
        description: "Sorting criteria for the result set"
      - field: search
        type: string
        description: "Optional case-insensitive search string to filter intent names"
  response:
    fields:
      - field: intent
        type: string
        description: "Name of the intent not currently connected to any pending or approved trigger"
      - field: total_pages
        type: number
        description: "Total number of pages available for the current filter and page size"
      - field: created
        type: timestamp
        description: "Timestamp of the most recent version of the intent"
*/
WITH connected_intents AS (
    SELECT intent,
           service,
           service_name,
           status,
           created
    FROM service_trigger
    WHERE (intent,
           service,
           service_name,
           created) IN (
           SELECT intent,
                  service,
                  service_name,
                  max(created)
           FROM service_trigger
           GROUP BY intent,
                    service,
                    service_name)
      AND status in ('pending', 'approved')
),
latest_intent_status AS (
    SELECT intent,
           isforservice,
           created,
           ROW_NUMBER() OVER (PARTITION BY intent ORDER BY created DESC) AS rn
    FROM intent
)
SELECT intent,
       CEIL(COUNT(*) OVER() / :page_size::DECIMAL) AS total_pages,
       created
FROM latest_intent_status
WHERE rn = 1 
  AND isforservice = true
  AND intent NOT IN (
      SELECT intent
      FROM connected_intents
  )
  AND (:search IS NULL OR intent ILIKE '%' || :search || '%')
ORDER BY
    CASE WHEN :sorting = 'intent asc' THEN intent END ASC,
    CASE WHEN :sorting = 'intent desc' THEN intent END DESC
OFFSET ((GREATEST(:page, 1) - 1) * :page_size) LIMIT :page_size;
