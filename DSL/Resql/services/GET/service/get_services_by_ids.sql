WITH latest_services AS (
  SELECT DISTINCT ON (service_id) id, name, service_id
  FROM services
  WHERE service_id = ANY(string_to_array(:serviceIds, ','))
    AND deleted IS FALSE
  ORDER BY service_id, id DESC
)
SELECT name, service_id
FROM latest_services;
