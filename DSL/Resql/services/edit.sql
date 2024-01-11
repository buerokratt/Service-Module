UPDATE services
SET 
  name = :name, 
  description = :description,
  structure = :structure::json
WHERE id = cast(:id as int);
