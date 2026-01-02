WITH input_names AS (
  SELECT TRIM(UNNEST(string_to_array(:names, ','))) AS name
),
processed_names AS (
  SELECT 
    CASE 
      WHEN EXISTS (
        SELECT 1 
        FROM services s
        WHERE s.name = iname.name 
        AND NOT s.deleted
      )
      THEN iname.name || '_' || to_char(NOW() AT TIME ZONE :timezone, 'YYYY_MM_DD_HH24_MI_SS')
      ELSE iname.name
    END AS processed_name
  FROM input_names iname
)
SELECT string_agg(processed_name, ',') AS names
FROM processed_names;
