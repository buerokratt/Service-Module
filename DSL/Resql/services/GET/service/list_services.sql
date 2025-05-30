/*
declaration:
  version: 0.1
  description: "Fetch paginated and sorted list of latest non-common, non-deleted services with total page count"
  method: get
  namespace: service
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
        enum: ['id asc', 'name asc', 'name desc', 'state asc', 'state desc']
        description: "Sorting criteria for the result set"
  response:
    fields:
      - field: name
        type: string
        description: "Name of the service"
      - field: description
        type: string
        description: "Description of the service"
      - field: state
        type: string
        enum: ['active', 'inactive', 'draft', 'ready']
        description: "Current state of the service"
      - field: type
        type: string
        enum: ['GET', 'POST']
        description: "Ruuter type associated with the service"
      - field: service_id
        type: string
        description: "Service identifier"
      - field: total_pages
        type: number
        description: "Total number of pages available for the given page size"
*/
WITH
    max_services AS (
        SELECT DISTINCT ON (service_id) id AS max_id
        FROM services.services
        ORDER BY service_id ASC, updated_at DESC
    )

SELECT
    name,
    description,
    current_state AS state,
    ruuter_type AS type,
    service_id,
    CEIL(COUNT(*) OVER () / :page_size::DECIMAL) AS total_pages
FROM services.services
    INNER JOIN max_services ON id = max_id
WHERE NOT deleted AND NOT is_common
ORDER BY
    CASE WHEN :sorting = 'id asc' THEN updated_at END ASC,
    CASE WHEN :sorting = 'name asc' THEN name END ASC,
    CASE WHEN :sorting = 'name desc' THEN name END DESC,
    CASE WHEN :sorting = 'state asc' THEN current_state END ASC,
    CASE WHEN :sorting = 'state desc' THEN current_state END DESC
OFFSET ((GREATEST(:page::INTEGER, 1) - 1) * :page_siz::INTEGER) LIMIT :page_size::INTEGER;
