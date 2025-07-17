WITH latest_services AS (
  SELECT DISTINCT ON (service_id) id, name, description, current_state, ruuter_type, is_common, service_id, slot
  FROM services
  WHERE NOT deleted AND is_common
  ORDER BY service_id, id DESC
)
SELECT
  name,
  description,
  current_state AS state,
  ruuter_type AS type,
  is_common AS isCommon,
  service_id,
  slot,
  CEIL(COUNT(*) OVER() / :page_size::DECIMAL) AS total_pages
FROM latest_services
ORDER BY
  CASE WHEN :sorting = 'id asc' THEN id END ASC,
  CASE WHEN :sorting = 'name asc' THEN name END ASC,
  CASE WHEN :sorting = 'name desc' THEN name END DESC,
  CASE WHEN :sorting = 'state asc' THEN current_state END ASC,
  CASE WHEN :sorting = 'state desc' THEN current_state END DESC
OFFSET ((GREATEST(:page, 1) - 1) * :page_size) LIMIT :page_size;
