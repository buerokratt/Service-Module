SELECT intent,
       status
FROM intent
WHERE intent IN (:intents)
  AND (intent, created) IN (
    SELECT intent, MAX(created)
    FROM intent
    WHERE intent IN (:intents)
    GROUP BY intent
  );
