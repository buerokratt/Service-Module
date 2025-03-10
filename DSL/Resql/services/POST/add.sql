INSERT INTO services (name, description, service_id, ruuter_type, is_common, structure)
VALUES (:name, :description, :service_id, :ruuter_type::ruuter_request_type, :is_common, :structure::json);
