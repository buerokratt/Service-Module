WITH connected_intents AS
  (SELECT intent,
          service,
          service_name,
          status,
          created
   FROM service_trigger
   WHERE (intent,
          service,
          service_name,
          created) IN
       (SELECT intent,
               service,
               service_name,
               max(created)
        FROM service_trigger
        GROUP BY intent,
                 service,
                 service_name)
     AND status in ('pending',
                    'approved'))
SELECT intent, CEIL(COUNT(*) OVER() / :page_size::DECIMAL) AS total_pages
FROM intent
WHERE intent NOT IN
    (SELECT intent
     FROM connected_intents)
ORDER BY 
   CASE WHEN :sorting = 'intent asc' THEN intent END ASC,
   CASE WHEN :sorting = 'intent desc' THEN intent END DESC
OFFSET ((GREATEST(:page, 1) - 1) * :page_size) LIMIT :page_size;
