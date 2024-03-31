#!/bin/bash

URL=$1
AUTH=$2
MOCK_ALLOWED=${3:-false}

if [[ -z $URL || -z $AUTH ]]; then
  echo "Url and Auth are required"
  exit 1
fi

#services
curl -H "Content-Type: application/x-ndjson" -X PUT "$URL/services" -ku "$AUTH" --data-binary "@fieldMappings/services.json"
if $MOCK_ALLOWED; then curl -H "Content-Type: application/x-ndjson" -X PUT "$URL/services/_bulk" -ku "$AUTH" --data-binary "@mock/services.json"; fi
curl -L -X POST '$URL/_scripts/get-services-stat' -H 'Content-Type: application/json' -H 'Cookie: customJwtCookie=test' --data-binary "@templates/get-services-stat.json"

#faults
curl -H "Content-Type: application/x-ndjson" -X PUT "$URL/faults" -ku "$AUTH" --data-binary "@fieldMappings/faults.json"
if $MOCK_ALLOWED; then curl -H "Content-Type: application/x-ndjson" -X PUT "$URL/faults/_bulk" -ku "$AUTH" --data-binary "@mock/faults.json"; fi
curl -L -X POST '$URL/_scripts/get-faults-by-request-id' -H 'Content-Type: application/json' -H 'Cookie: customJwtCookie=test' --data-binary "@templates/get-faults-by-request-id.json"
curl -L -X POST '$URL/_scripts/get-faults-by-level' -H 'Content-Type: application/json' -H 'Cookie: customJwtCookie=test' --data-binary "@templates/get-faults-by-level.json"
