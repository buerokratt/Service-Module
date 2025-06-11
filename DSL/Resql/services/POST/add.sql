INSERT INTO services (name, description, slot, service_id, ruuter_type, is_common, current_state, structure)
VALUES (:name, :description, :slot, :service_id, :ruuter_type::ruuter_request_type, :is_common, :state::service_state, :structure::json);
