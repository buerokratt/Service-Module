SELECT EXISTS (
  SELECT 1
  FROM services s
  JOIN (
    SELECT MAX(id) AS maxId
    FROM services
    GROUP BY service_id
  ) latest ON s.id = latest.maxId
  WHERE s.name = :name
  AND NOT s.deleted
  LIMIT 1
) AS name_exists;
