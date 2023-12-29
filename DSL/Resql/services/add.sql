INSERT INTO services (name, description, service_id, ruuter_type, is_common, structure)
VALUES (:name, :description, :service_id, :ruuter_type::ruuter_request_type, :is_common, :structure::json)
ON CONFLICT (service_id) DO UPDATE
SET name = EXCLUDED.name,
    description = EXCLUDED.description,
    ruuter_type = EXCLUDED.ruuter_type;
