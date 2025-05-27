
SELECT intent,
       service,
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
  AND status in ('approved')
