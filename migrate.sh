#!/bin/bash
docker run --rm --network bykstack -v $(pwd)/DSL/Liquibase:/liquibase/changelog liquibase/liquibase -v $(pwd)/DSL/Liquibase/changelog.yml:/liquibase/changelog.yml --defaultsFile=/liquibase/changelog/liquibase.properties --changelog-file=changelog.yml update
