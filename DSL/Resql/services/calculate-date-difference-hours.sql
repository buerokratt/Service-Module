SELECT ROUND(
    EXTRACT(
      EPOCH
      FROM (:endDate::timestamp - :startDate::timestamp)
    ) / 3600
  ) AS result;
