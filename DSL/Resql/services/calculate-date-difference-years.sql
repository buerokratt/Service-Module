SELECT ROUND(
    DATE_PART(
      'year',
      AGE(
        :endDate::date,
        :startDate::date
      )
    )::numeric
  ) AS result;
