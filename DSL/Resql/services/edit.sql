UPDATE services
SET 
  name = :name, 
  description = :description,
  structure = :structure::json
WHERE service_id = :id;
