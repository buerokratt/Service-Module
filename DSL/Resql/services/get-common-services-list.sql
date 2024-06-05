WITH MaxServices AS (
  SELECT MAX(id) AS maxId
  FROM services
  GROUP BY service_id
)
SELECT
  id,
  name,
  description,
  current_state AS state,
  ruuter_type AS type,
  is_common AS isCommon,
  structure::json,
  subquery.endpoints::json AS endpoints,
  service_id,
  CEIL(COUNT(*) OVER() / :page_size::DECIMAL) AS total_pages
FROM services
JOIN MaxServices ON id = maxId
JOIN (
  SELECT jsonb_agg(endpoint) AS endpoints
  FROM (
    SELECT DISTINCT endpoint
    FROM (
      SELECT endpoint::jsonb
      FROM services, json_array_elements(endpoints) AS endpoint
      WHERE (endpoint->>'isCommon')::boolean = true
      UNION
      SELECT endpoint::jsonb
      FROM services, json_array_elements(endpoints) AS endpoint, MaxServices
      WHERE id = maxId
    ) AS combined_endpoints
  ) subquery
) subquery ON true
WHERE NOT deleted AND is_common
ORDER BY 
   CASE WHEN :sorting = 'id asc' THEN id END ASC,
   CASE WHEN :sorting = 'name asc' THEN name END ASC,
   CASE WHEN :sorting = 'name desc' THEN name END DESC,
   CASE WHEN :sorting = 'state asc' THEN current_state END ASC,
   CASE WHEN :sorting = 'state desc' THEN current_state END DESC
OFFSET ((GREATEST(:page, 1) - 1) * :page_size) LIMIT :page_size;
