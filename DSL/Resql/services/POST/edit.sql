INSERT INTO services (name, description, slot, ruuter_type, current_state, service_id, is_common, structure)
SELECT
  :name,
  :description,
  :slot,
  ruuter_type,
  :state::service_state,
  service_id,
  COALESCE(:is_common, false) AS is_common,
  :structure::json
FROM services
WHERE service_id = :id
ORDER BY id DESC
LIMIT 1;
