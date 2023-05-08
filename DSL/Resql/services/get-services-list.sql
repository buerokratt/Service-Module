SELECT array_agg(
    json_build_object(
      name,
      json_build_object(
        'id',
        id,
        'state',
        current_state,
        'type',
        ruuter_type
      )
    )
  ) AS services_list
FROM services;
