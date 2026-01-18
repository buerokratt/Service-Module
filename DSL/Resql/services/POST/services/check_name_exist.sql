SELECT EXISTS (
  SELECT 1
  FROM services
  WHERE name = :name
    AND NOT deleted
  LIMIT 1
) AS name_exists;
