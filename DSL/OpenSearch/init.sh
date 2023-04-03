#clear
curl -XDELETE 'http://localhost:9200/*' -u admin:admin --insecure

#intents
curl -H "Content-Type: application/x-ndjson" -X PUT "http://localhost:9200/intents" -ku admin:admin --data-binary "@fieldMappings/intents.json"
curl -H "Content-Type: application/x-ndjson" -X PUT "http://localhost:9200/intents/_bulk" -ku admin:admin --data-binary "@mock/intents.json"
curl -L -X POST 'http://localhost:9200/_scripts/search_intents' -H 'Content-Type: application/json' --data-binary "@templates/search_intents.json"

