UPDATE endpoints
SET
    last_test_at           = NOW(),
    verification_status    = :verificationStatus,
    last_status_code       = :lastStatusCode,
    response_schema        = CASE
                                 WHEN :captureSchema THEN :responseSchema::jsonb
                                 ELSE response_schema
                             END,
    response_schema_captured = CASE
                                   WHEN :captureSchema THEN TRUE
                                   ELSE response_schema_captured
                               END
WHERE endpoint_id = :endpointId::uuid;
