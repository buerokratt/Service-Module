#!/bin/bash
docker run --rm --network bykstack \
  -v $(pwd)/DSL/Liquibase:/workspace \
  -w /workspace \
  liquibase/liquibase \
  --defaultsFile=liquibase.properties \
  --changelog-file=changelog.yaml \
  update
