
SELECT service_id, name
FROM (
  SELECT DISTINCT ON (service_id) service_id, name, current_state
  FROM services
  WHERE NOT deleted
    AND is_common = false
  ORDER BY service_id, id DESC
) latest
WHERE current_state IN ('active', 'ready', 'draft')
ORDER BY name ASC;
