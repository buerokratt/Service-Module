INSERT INTO services (name, description, service_id, ruuter_type, structure)
SELECT 
    name,
    '',
    gen_random_uuid(),
    'POST'::ruuter_request_type,
    structure
FROM UNNEST(
    ARRAY[:names]::text[],
    ARRAY[:structures]::json[]
) AS t(name, structure);
