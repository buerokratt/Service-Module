SELECT COALESCE(
    json_agg(
      json_build_object(
        name,
        json_build_object(
          'id',
          id,
          'state',
          current_state,
          'type',
          ruuter_type
        )::json
      )::json
    ),
    '[]'
  ) AS services_list
FROM services;
