#clear
curl -XDELETE 'http://localhost:9200/*' -u admin:admin --insecure

#intents
curl -H "Content-Type: application/x-ndjson" -X PUT "http://localhost:9200/intents" -ku admin:admin --data-binary "@fieldMappings/intents.json"
curl -H "Content-Type: application/x-ndjson" -X PUT "http://localhost:9200/intents/_bulk" -ku admin:admin --data-binary "@mock/intents.json"
curl -L -X POST 'http://localhost:9200/_scripts/search_intents' -H 'Content-Type: application/json' --data-binary "@templates/search_intents.json"

#services
curl -H "Content-Type: application/x-ndjson" -X PUT "http://localhost:9200/services" -ku admin:admin --data-binary "@fieldMappings/services.json"
curl -H "Content-Type: application/x-ndjson" -X PUT "http://localhost:9200/services/_bulk" -ku admin:admin --data-binary "@mock/services.json"
curl -L -X POST 'http://localhost:9200/_scripts/get-services-stat' -H 'Content-Type: application/json' -H 'Cookie: customJwtCookie=test' --data-binary "@templates/get-services-stat.json"

#logs
curl -H "Content-Type: application/x-ndjson" -X PUT "http://localhost:9200/logs" -ku admin:admin --data-binary "@fieldMappings/logs.json"
curl -H "Content-Type: application/x-ndjson" -X PUT "http://localhost:9200/logs/_bulk" -ku admin:admin --data-binary "@mock/logs.json"
curl -L -X POST 'http://localhost:9200/_scripts/get-log-by-request-id' -H 'Content-Type: application/json' -H 'Cookie: customJwtCookie=test' --data-binary "@templates/get-log-by-request-id.json"
curl -L -X POST 'http://localhost:9200/_scripts/get-log-by-level' -H 'Content-Type: application/json' -H 'Cookie: customJwtCookie=test' --data-binary "@templates/get-log-by-level.json"
