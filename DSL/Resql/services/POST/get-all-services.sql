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
  WHERE NOT deleted
),
service_counts AS (
  SELECT COUNT(DISTINCT service_id) AS total_count
  FROM services
  WHERE NOT deleted
),
distinct_services AS (
  SELECT DISTINCT ON (service_id)
    service_id,
    name,
    description,
    state,
    type,
    slot,
    structure
  FROM filtered_services
  ORDER BY 
    service_id
)
SELECT
  ds.service_id,
  ds.name,
  ds.description,
  ds.state,
  ds.type,
  ds.slot,
  ds.structure,
  CEIL(sc.total_count / :page_size::DECIMAL) AS total_pages
FROM distinct_services ds
CROSS JOIN service_counts sc
ORDER BY 
  CASE WHEN :sorting = 'name asc' THEN ds.name END ASC,
  CASE WHEN :sorting = 'name desc' THEN ds.name END DESC,
  CASE WHEN :sorting = 'state asc' THEN ds.state END ASC,
  CASE WHEN :sorting = 'state desc' THEN ds.state END DESC,
  ds.name asc
OFFSET ((GREATEST(:page, 1) - 1) * :page_size) LIMIT :page_size;
