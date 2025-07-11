WITH MaxServices AS (
  SELECT MAX(id) AS maxId
  FROM services
  GROUP BY service_id
)
SELECT
  name,
  description,
  current_state AS state,
  ruuter_type AS type,
  service_id,
  slot,
  CEIL(COUNT(*) OVER() / :page_size::DECIMAL) AS total_pages
FROM services
JOIN MaxServices ON id = maxId
WHERE NOT deleted AND NOT is_common
ORDER BY 
   CASE WHEN :sorting = 'id asc' THEN id END ASC,
   CASE WHEN :sorting = 'name asc' THEN name END ASC,
   CASE WHEN :sorting = 'name desc' THEN name END DESC,
   CASE WHEN :sorting = 'state asc' THEN current_state END ASC,
   CASE WHEN :sorting = 'state desc' THEN current_state END DESC
OFFSET ((GREATEST(:page, 1) - 1) * :page_size) LIMIT :page_size;
