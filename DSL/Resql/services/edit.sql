UPDATE services
SET 
  name = :name, 
  description = :description
WHERE id = cast(:id as int);
