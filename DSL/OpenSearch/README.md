# Opensearch commands
##### To reset indexes
```
curl -XDELETE 'http://localhost:9200/*' -u admin:admin --insecure
```
##### To load all indexes with mock data
```
sh init.sh
```
## Intents
##### Create intents index
```
curl -H "Content-Type: application/x-ndjson" -X PUT "http://localhost:9200/intents" -ku admin:admin --data-binary "@fieldMappings/intents.json"
```
##### Add mock data from intents.json file
```
curl -H "Content-Type: application/x-ndjson" -X PUT "http://localhost:9200/intents/_bulk" -ku admin:admin --data-binary "@mock/intents.json"
```
##### Test query to index to validate that mock data is there
```
curl -H 'Content-Type: application/json' -X GET "http://localhost:9200/intents/_search?pretty=true" -ku admin:admin -d' {"query":{"match":{"intent":"common_tervitus"}}}'
```
##### Templates for searching intents
```
curl -L -X POST 'http://localhost:9200/_scripts/search_intents' -H 'Content-Type: application/json' --data-binary "@templates/search_intents.json"
```
##### Test template
```
curl -L -X GET 'http://localhost:9200/intents/_search/template' -H 'Content-Type: application/json' --data-raw '{"id": "search_intents", "params": {"keyword": "andmekaitse"}}'