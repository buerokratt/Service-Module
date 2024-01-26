UPDATE services
SET endpoints = :endpoints::json
WHERE service_id = :id;
