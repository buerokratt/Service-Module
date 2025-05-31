COPY (
    SELECT *
    FROM services.services
    WHERE (service_id, updated_at) NOT IN (
        SELECT service_id, max(updated_at)
        FROM services.services
        GROUP BY service_id
    ) AND updated_at < %(export_boundary)s
) TO stdout WITH csv HEADER;
