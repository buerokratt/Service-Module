INSERT INTO services (name, description, slot, examples, entities, service_id, ruuter_type, is_common, current_state, structure)
VALUES (:name, :description, :slot, ARRAY[:examples]::text[], ARRAY[:entities]::text[], :service_id, :ruuter_type::ruuter_request_type, :is_common, :state::service_state, :structure::json);
