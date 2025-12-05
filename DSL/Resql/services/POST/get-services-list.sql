SELECT
  name,
  description,
  current_state AS state,
  ruuter_type AS type,
  service_id,
  slot,
  CEIL(COUNT(*) OVER() / :page_size::DECIMAL) AS total_pages
FROM services
WHERE NOT deleted AND NOT is_common
ORDER BY 
   CASE WHEN :sorting = 'name asc' THEN name END ASC,
   CASE WHEN :sorting = 'name desc' THEN name END DESC,
   CASE WHEN :sorting = 'state asc' THEN current_state END ASC,
   CASE WHEN :sorting = 'state desc' THEN current_state END DESC,
   name ASC
OFFSET ((GREATEST(:page, 1) - 1) * :page_size) LIMIT :page_size;
