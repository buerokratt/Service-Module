WITH existing AS (
  SELECT service_ids FROM endpoints WHERE id = :id::uuid ORDER BY created_at DESC LIMIT 1
)
INSERT INTO endpoints (id, service_ids, name, type, file_name, is_common, definitions)
VALUES (
  :id::uuid,
  (
    SELECT
      CASE
        WHEN existing.service_ids IS NOT NULL
        THEN (
          SELECT ARRAY(
            SELECT DISTINCT unnest(existing.service_ids || :serviceId::uuid)
          )
        )
        ELSE ARRAY[:serviceId::uuid]
      END
    FROM existing
  ),
  :name,
  :type::endpoint_type,
  :fileName,
  :isCommon,
  :definitions::jsonb
);
-- todo rename file to update-endpoint.sql + all related