INSERT INTO services (name, description, slot, service_id, ruuter_type, is_common, structure)
VALUES (:name, :description, :slot, :service_id, :ruuter_type::ruuter_request_type, :is_common, :structure::json);
