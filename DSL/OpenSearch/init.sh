#clear
curl -XDELETE 'https://localhost:9200/*' -u admin:admin --insecure

#intents
curl -H "Content-Type: application/x-ndjson" -X PUT "https://localhost:9200/intents" -ku admin:admin --data-binary "@fieldMappings/intents.json"
curl -H "Content-Type: application/x-ndjson" -X PUT "https://localhost:9200/intents/_bulk" -ku admin:admin --data-binary "@mock/intents.json"