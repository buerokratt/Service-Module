# Bürokratt's Service Module

Bürokratt's Service Module is a tool to help primarily product owners in collaboration with customer support agents/service managers to create, edit and otherwise manipulate Bürokratt's e-services via a graphical user interface. This includes setting up Ruuter- and Rasa-based user stories, making X-road / REST / database requests where and when appropriate and so forth.

Service Module focuses on the part of creation of any service where Bürokratt users can define service endpoints (i.e API or X-Road) whereas Training Module focuses on Rasa's side.

# Scope

This repo will primarily contain:

1. Architectural and other documentation;
2. Docker Compose file to set up and run Bürokratt's Service Module as a fully functional service;
3. Tests specific to Bürokratt's Service Module.

## Dev setup

- Clone [Ruuter](https://github.com/buerokratt/Ruuter)

- For Apple Silicon, replace Ruuter's Dockerfile line and add platform specification FROM --platform=linux/amd64 openjdk:17-jdk-alpine

- Ruuter has an unresolved issue with allowing cross-origin credentials to be sent, for now fix this by adding: .allowCredentials(true); to line 24 in CORSConfiguration.java

- Navigate to Ruuter and build the image docker build -t ruuter .

- Clone [Resql](https://github.com/buerokratt/Resql)

- Navigate to Resql and build the image docker build -t resql .

- Clone [Data Mapper](https://github.com/buerokratt/DataMapper)

- Navigate to Data Mapper and build the image docker build -t datamapper-node .

- Navigate to current repo and run docker compose up -d

- Go to https://localhost:3001

### Database setup

- For setting up the users database initially, run
  `docker run --platform linux/amd64 --network=bykstack riaee/byk-users-db:liquibase20220615 --url=jdbc:postgresql://database:5432/users_db --username=byk --password=01234 --changelog-file=./master.yml update`
