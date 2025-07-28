#!/bin/bash
docker run --rm --network bykstack -v $(pwd)/DSL/Liquibase:/liquibase/changelog liquibase/liquibase -v $(pwd)/DSL/Liquibase/changelog.yaml:/liquibase/changelog.yaml --defaultsFile=/liquibase/changelog/liquibase.properties --changelog-file=changelog.yaml update
