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
SELECT id_code
FROM "user"
WHERE login = :login
    AND password_hash = :password
    AND id IN (
        SELECT DISTINCT ON (id_code) id
        FROM "user"
        ORDER BY id_code, created DESC
    )
    AND status != 'deleted'
LIMIT 1;
