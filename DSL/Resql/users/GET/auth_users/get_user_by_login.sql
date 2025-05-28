/*
declaration:
  version: 0.1
  description: "Authenticate user by login and password hash, and return user profile with authorities if valid"
  method: post
  namespace: auth_users
  returns: json
  allowlist:
    query:
      - field: login
        type: string
        description: "User login name"
      - field: password
        type: string
        description: "User password hash for authentication"
  response:
    fields:
      - field: login
        type: string
        description: "Login name of the authenticated user"
      - field: first_name
        type: string
        description: "First name of the user"
      - field: last_name
        type: string
        description: "Last name of the user"
      - field: id_code
        type: string
        description: "Unique identifier (ID code) of the user"
      - field: display_name
        type: string
        description: "Display name used in the system"
      - field: authorities
        type: array
        items:
          type: string
          enum: ['ROLE_ADMINISTRATOR', 'ROLE_SERVICE_MANAGER', 'ROLE_CUSTOMER_SUPPORT_AGENT', 'ROLE_CHATBOT_TRAINER', 'ROLE_ANALYST', 'ROLE_UNAUTHENTICATED']
        description: "List of authority roles assigned to the user"
*/
SELECT u.login,
       u.first_name,
       u.last_name,
       u.id_code,
       u.display_name,
       ua.authority_name AS authorities
FROM "user" u
         INNER JOIN (SELECT authority_name, user_id
                     FROM user_authority AS ua
                     WHERE ua.id IN (SELECT max(id)
                                     FROM user_authority
                                     GROUP BY user_id)) ua ON u.id_code = ua.user_id
WHERE login = :login
  AND password_hash = :password
  AND array_length(authority_name, 1) > 0;
