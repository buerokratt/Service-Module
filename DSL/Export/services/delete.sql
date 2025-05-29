DELETE FROM services
WHERE (service_id, updated_at) NOT IN (
    SELECT service_id, max(updated_at)
    FROM services
    GROUP BY service_id
) AND updated_at < %(export_boundary)s;
