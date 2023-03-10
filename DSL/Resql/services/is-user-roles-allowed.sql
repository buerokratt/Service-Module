SELECT ARRAY[(
    SELECT array_agg(authorities)::text[] AS "user_roles"
    FROM (
        SELECT unnest(authority_name) AS authorities
        FROM public.user_authority
        WHERE user_id = :userId::text
        ORDER BY authorities
      ) AS _
  )] @> ARRAY[(:allowedRoles)]::text[] as "is_allowed";
