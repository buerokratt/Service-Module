SELECT name, service_id
FROM services
WHERE service_id = ANY(string_to_array(:serviceIds, ','))
  AND deleted IS FALSE;
