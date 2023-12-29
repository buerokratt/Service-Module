SELECT name, STRUCTURE->'endpoints' AS endpoints
FROM services
WHERE STRUCTURE->'endpoints' IS NOT NULL;
