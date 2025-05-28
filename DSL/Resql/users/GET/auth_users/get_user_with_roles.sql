SELECT
    login,
    first_name,
    last_name,
    id_code,
    display_name,
    authority_name AS authorities
FROM denormalized_user_data
WHERE
    id_code = :login
ORDER BY created DESC
LIMIT 1;
