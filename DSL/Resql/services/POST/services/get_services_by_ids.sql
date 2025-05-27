WITH latest_services AS (
  SELECT DISTINCT ON (service_id) id, name, service_id
  FROM services
  WHERE service_id = ANY(ARRAY['698a8ce0-c7f2-4663-b07b-b22ce2eee1de', 'another-id'])
    AND deleted IS FALSE
  ORDER BY service_id, id DESC
)
SELECT name, service_id
FROM latest_services;
