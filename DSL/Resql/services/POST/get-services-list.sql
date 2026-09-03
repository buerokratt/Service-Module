SELECT
  id,
  service_id,
  name,
  description,
  examples,
  entities,
  current_state AS state,
  ruuter_type AS type,
  is_common,
  slot,
  CEIL((SELECT COUNT(DISTINCT service_id) FROM services WHERE NOT deleted AND (:is_common::TEXT = '' OR is_common = (:is_common::TEXT)::BOOLEAN) AND (:search IS NULL OR :search = '' OR LOWER(name) LIKE LOWER('%' || :search || '%') OR LOWER(description) LIKE LOWER('%' || :search || '%'))) / :page_size::DECIMAL) AS total_pages
FROM services
WHERE NOT deleted
  AND (:is_common::TEXT = '' OR is_common = (:is_common::TEXT)::BOOLEAN)
  AND (:search IS NULL OR :search = '' OR LOWER(name) LIKE LOWER('%' || :search || '%') OR LOWER(description) LIKE LOWER('%' || :search || '%'))
ORDER BY
  CASE WHEN :search IS NOT NULL AND :search != '' AND LOWER(name) = LOWER(:search) THEN 0
       WHEN :search IS NOT NULL AND :search != '' AND LOWER(name) LIKE LOWER(:search || '%') THEN 1
       WHEN :search IS NOT NULL AND :search != '' AND LOWER(name) LIKE LOWER('%' || :search || '%') THEN 2
       ELSE 3 END,
  CASE WHEN :sorting = 'name asc' THEN name END ASC,
  CASE WHEN :sorting = 'name desc' THEN name END DESC,
  CASE WHEN :sorting = 'state asc' THEN current_state END ASC,
  CASE WHEN :sorting = 'state desc' THEN current_state END DESC,
  CASE WHEN :sorting = 'id asc' THEN id END ASC,
  CASE WHEN :sorting = 'id desc' THEN id END DESC,
  id ASC
OFFSET ((GREATEST(:page, 1) - 1) * :page_size) LIMIT :page_size;
