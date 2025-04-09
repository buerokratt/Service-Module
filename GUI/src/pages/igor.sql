SELECT *
FROM services
WHERE jsonb_path_exists(
    structure::jsonb,
    '$.**.originalDefinedNodeId ? (@ == "cb1534cd-b5b2-43e0-96c4-32cc21dd3f66")'
);