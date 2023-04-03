#clear
curl -XDELETE 'http://localhost:9200/*' -u admin:admin --insecure

#services
curl -H "Content-Type: application/x-ndjson" -X PUT "http://localhost:9200/services" -ku admin:admin --data-binary "@fieldMappings/services.json"
curl -H "Content-Type: application/x-ndjson" -X PUT "http://localhost:9200/services/_bulk" -ku admin:admin --data-binary "@mock/services.json"
curl -L -X POST 'http://localhost:9200/_scripts/get-services-stat' -H 'Content-Type: application/json' -H 'Cookie: customJwtCookie=test' --data-binary "@templates/get-services-stat.json"
