SELECT
  endpoint_id,
  service_id,
  name,
  type,
  is_common,
  definitions,
  last_test_at,
  verification_status,
  last_status_code,
  response_schema_captured AS schema_captured,
  response_schema,
  CASE WHEN :pagination THEN CEIL(COUNT(*) OVER() / :page_size::DECIMAL) ELSE 1 END AS total_pages
FROM endpoints
WHERE deleted IS FALSE
  AND (:search IS NULL OR :search = '' OR LOWER(name) LIKE LOWER('%' || :search || '%'))
ORDER BY
  CASE WHEN :sorting = 'created_at asc' THEN created_at END ASC NULLS LAST,
  CASE WHEN :sorting = 'created_at desc' THEN created_at END DESC NULLS LAST,
  CASE WHEN :sorting = 'name asc' THEN name END ASC NULLS LAST,
  CASE WHEN :sorting = 'name desc' THEN name END DESC NULLS LAST,
  CASE WHEN :sorting = 'lastTestAt asc' THEN last_test_at END ASC NULLS LAST,
  CASE WHEN :sorting = 'lastTestAt desc' THEN last_test_at END DESC NULLS LAST,
  CASE WHEN :sorting = 'verificationStatus asc' THEN verification_status END ASC NULLS LAST,
  CASE WHEN :sorting = 'verificationStatus desc' THEN verification_status END DESC NULLS LAST,
  CASE WHEN :sorting = 'schemaCaptured asc' THEN response_schema_captured END ASC NULLS LAST,
  CASE WHEN :sorting = 'schemaCaptured desc' THEN response_schema_captured END DESC NULLS LAST,
  created_at DESC
OFFSET (CASE WHEN :pagination THEN (GREATEST(:page, 1) - 1) * :page_size ELSE 0 END)
LIMIT (CASE WHEN :pagination THEN :page_size END);
