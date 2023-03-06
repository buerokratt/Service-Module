SELECT ROUND(
    EXTRACT(
      EPOCH
      FROM (:endDate::timestamp - :startDate::timestamp)
    )
  ) AS result;
