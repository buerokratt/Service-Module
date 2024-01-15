UPDATE services
SET endpoints = :endpoints::json
WHERE id = cast(:id as int);
