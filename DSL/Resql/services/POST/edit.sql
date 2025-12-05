UPDATE services
SET
    name = :name,
    description = :description,
    slot = :slot,
    examples = ARRAY[:examples]::text[],
    entities = ARRAY[:entities]::text[],
    current_state = :state::service_state,
    is_common = COALESCE(:is_common, false),
    structure = :structure::json
WHERE service_id = :id;
