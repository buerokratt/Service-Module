#clear
curl -XDELETE 'http://localhost:9200/*' -u admin:admin --insecure

#logs
curl -H "Content-Type: application/x-ndjson" -X PUT "http://localhost:9200/logs" -ku admin:admin --data-binary "@fieldMappings/logs.json"
curl -H "Content-Type: application/x-ndjson" -X PUT "http://localhost:9200/logs/_bulk" -ku admin:admin --data-binary "@mock/logs.json"
curl -L -X POST 'http://localhost:9200/_scripts/get-log-by-request' -H 'Content-Type: application/json' -H 'Cookie: customJwtCookie=test' --data-binary "@templates/get-log-by-request.json"
curl -L -X POST 'http://localhost:9200/_scripts/get-log-by-service' -H 'Content-Type: application/json' -H 'Cookie: customJwtCookie=test' --data-binary "@templates/get-log-by-service.json"
