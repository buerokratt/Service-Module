SELECT ROUND(
    EXTRACT(
      EPOCH
      FROM (:endDate::timestamp - :startDate::timestamp)
    ) / 60
  ) AS result;
