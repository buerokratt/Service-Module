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

#responses
curl -H "Content-Type: application/x-ndjson" -X PUT "http://localhost:9200/responses" -ku admin:admin --data-binary "@fieldMappings/responses.json"
curl -H "Content-Type: application/x-ndjson" -X PUT "http://localhost:9200/responses/_bulk" -ku admin:admin --data-binary "@mock/responses.json"
curl -L -X POST 'http://localhost:9200/_scripts/response-with-name-and-text' -H 'Content-Type: application/json' -H 'Cookie: customJwtCookie=test' --data-binary "@templates/response-with-name-and-text.json"

#Entities
curl -H "Content-Type: application/x-ndjson" -X PUT "http://localhost:9200/entities" -ku admin:admin --data-binary "@fieldMappings/entities.json"
curl -H "Content-Type: application/x-ndjson" -X PUT "http://localhost:9200/entities/_bulk" -ku admin:admin --data-binary "@mock/entities.json"
curl -L -X POST 'http://localhost:9200/_scripts/entity-with-name' -H 'Content-Type: application/json' -H 'Cookie: customJwtCookie=test' --data-binary "@templates/entity-with-name.json"
curl -L -X POST 'http://localhost:9200/_scripts/entities-with-examples' -H 'Content-Type: application/json' -H 'Cookie: customJwtCookie=test' --data-binary "@templates/entities-with-examples.json"

#Regexes
curl -H "Content-Type: application/x-ndjson" -X PUT "http://localhost:9200/regexes" -ku admin:admin --data-binary "@fieldMappings/regexes.json"
curl -H "Content-Type: application/x-ndjson" -X PUT "http://localhost:9200/regexes/_bulk" -ku admin:admin --data-binary "@mock/regexes.json"
curl -L -X POST 'http://localhost:9200/_scripts/regex-with-name' -H 'Content-Type: application/json' -H 'Cookie: customJwtCookie=test' --data-binary "@templates/regex-with-name.json"

#Examples entities
curl -H "Content-Type: application/x-ndjson" -X PUT "http://localhost:9200/examples-entities" -ku admin:admin --data-binary "@fieldMappings/examples-entities.json"
curl -H "Content-Type: application/x-ndjson" -X PUT "http://localhost:9200/examples-entities/_bulk" -ku admin:admin --data-binary "@mock/examples-entities.json"

#faultas
curl -H "Content-Type: application/x-ndjson" -X PUT "http://localhost:9200/faults" -ku admin:admin --data-binary "@fieldMappings/faults.json"
curl -H "Content-Type: application/x-ndjson" -X PUT "http://localhost:9200/faults/_bulk" -ku admin:admin --data-binary "@mock/faults.json"
curl -L -X POST 'http://localhost:9200/_scripts/get-faults-by-request-id' -H 'Content-Type: application/json' -H 'Cookie: customJwtCookie=test' --data-binary "@templates/get-faults-by-request-id.json"
curl -L -X POST 'http://localhost:9200/_scripts/get-faults-by-level' -H 'Content-Type: application/json' -H 'Cookie: customJwtCookie=test' --data-binary "@templates/get-faults-by-level.json"
