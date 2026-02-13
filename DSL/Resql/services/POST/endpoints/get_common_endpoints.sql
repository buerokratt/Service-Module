SELECT
  endpoint_id,
  name,
  type,
  is_common,
  definitions,
  CASE WHEN :pagination THEN CEIL(COUNT(*) OVER() / :page_size::DECIMAL) ELSE 1 END AS total_pages
FROM endpoints
WHERE is_common = true
  AND deleted IS FALSE
  AND (:search IS NULL OR :search = '' OR LOWER(name) LIKE LOWER('%' || :search || '%'))
ORDER BY
  CASE WHEN :sorting = 'created_at asc' THEN created_at END ASC NULLS LAST,
  CASE WHEN :sorting = 'created_at desc' THEN created_at END DESC NULLS LAST,
  CASE WHEN :sorting = 'name asc' THEN name END ASC NULLS LAST,
  CASE WHEN :sorting = 'name desc' THEN name END DESC NULLS LAST,
  created_at DESC
OFFSET (CASE WHEN :pagination THEN (GREATEST(:page, 1) - 1) * :page_size ELSE 0 END)
LIMIT (CASE WHEN :pagination THEN :page_size END);
