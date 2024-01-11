UPDATE services
SET 
  name = :name, 
  description = :description,
  structure = :structure::jsonb
WHERE id = cast(:id as int);
