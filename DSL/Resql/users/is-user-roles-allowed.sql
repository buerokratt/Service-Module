SELECT COALESCE(
    (
      SELECT array_agg(UPPER(authorities))::text [] AS "user_roles"
      FROM (
          SELECT unnest(authority_name) AS authorities
          FROM public.user_authority
          WHERE user_id = :userId::text
          ORDER BY authorities
        ) AS _
    ) && (
      SELECT (
          SELECT array_agg(UPPER(allowedRole))::text [] AS "roles"
          FROM(
              SELECT unnest(ARRAY [:allowedRoles::text]::text []) AS allowedRole
              ORDER BY allowedRole
            ) as __
        )
    ),
    FALSE
  ) AS "is_allowed";
