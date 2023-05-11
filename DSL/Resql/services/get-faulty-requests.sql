SELECT f1.*
FROM Faults f1
JOIN Faults f2 ON f1.content = f2.content
  AND f2.statusCode >= 400
  AND f2.level IN ('ERROR')
  AND f2.timestamp >= DATEADD(minute, -1, f1.timestamp)
  AND f2.timestamp < f1.timestamp
WHERE f1.level IN ('ERROR')
  AND f1.timestamp > DATEADD(minute, -1, GETUTCDATE())
