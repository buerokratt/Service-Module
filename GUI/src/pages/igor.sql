SELECT DISTINCT ON (service_id) *
FROM services
WHERE jsonb_path_exists(
        structure::jsonb,
        '$.**.originalDefinedNodeId ? (@ == "cb1534cd-b5b2-43e0-96c4-32cc21dd3f66")'
      )
  AND service_id != 'bf226d47-ee80-48be-9861-1e08b8fcaa87'
ORDER BY service_id, id DESC;