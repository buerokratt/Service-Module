WITH filtered_services AS (
  SELECT
    service_id,
    name,
    description,
    current_state AS state,
    ruuter_type AS type,
    slot,
    structure
  FROM services
  WHERE NOT deleted AND 
    is_common = :is_common::BOOLEAN
),
service_counts AS (
  SELECT COUNT(DISTINCT service_id) AS total_count
  FROM services
  WHERE NOT deleted AND 
    is_common = :is_common::BOOLEAN
)
SELECT
  fs.service_id,
  fs.name,
  fs.description,
  fs.state,
  fs.type,
  fs.slot,
  fs.structure,
  CEIL(sc.total_count / :page_size::DECIMAL) AS total_pages
FROM filtered_services fs
CROSS JOIN service_counts sc
ORDER BY 
  CASE WHEN :sorting = 'name asc' THEN fs.name END ASC,
  CASE WHEN :sorting = 'name desc' THEN fs.name END DESC,
  CASE WHEN :sorting = 'state asc' THEN fs.state END ASC,
  CASE WHEN :sorting = 'state desc' THEN fs.state END DESC,
  fs.name asc
OFFSET ((GREATEST(:page, 1) - 1) * :page_size) LIMIT :page_size;
