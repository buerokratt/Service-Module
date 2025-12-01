WITH MaxServicesSettings AS (
  SELECT MAX(id) AS maxId
  FROM services_settings
  GROUP BY name
)
SELECT name, value
FROM services_settings
JOIN MaxServicesSettings ON id = maxId;
