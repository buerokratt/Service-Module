SELECT EXTRACT(
    YEAR
    FROM AGE(
        :endDate::timestamp,
        :startDate::timestamp
      )
  ) * 12 + EXTRACT(
    MONTH
    FROM age(
        :endDate::timestamp,
        :startDate::timestamp
      )
  ) AS result;
