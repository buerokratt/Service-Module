WITH connected_intents AS (
    SELECT intent,
           service,
           service_name,
           status,
           created
    FROM service_trigger
    WHERE (intent,
           service,
           service_name,
           created) IN (
           SELECT intent,
                  service,
                  service_name,
                  max(created)
           FROM service_trigger
           GROUP BY intent,
                    service,
                    service_name)
      AND status IN ('pending', 'approved')
),
latest_intent_status AS (
    SELECT intent,
           isforservice,
           created,
           ROW_NUMBER() OVER (PARTITION BY intent ORDER BY created DESC) AS rn
    FROM intent
)
SELECT intent,
       CEIL(COUNT(*) OVER() / :page_size::DECIMAL) AS total_pages,
       created
FROM latest_intent_status
WHERE rn = 1 
  AND isforservice = true
  AND intent NOT IN (
      SELECT intent
      FROM connected_intents
  )
  AND (:search IS NULL OR intent ILIKE '%' || :search || '%')
  AND status = 'ACTIVE'
ORDER BY
    CASE WHEN :sorting = 'intent asc' THEN intent END ASC,
    CASE WHEN :sorting = 'intent desc' THEN intent END DESC
OFFSET ((GREATEST(:page, 1) - 1) * :page_size) LIMIT :page_size;
