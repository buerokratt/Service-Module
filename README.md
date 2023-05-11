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

- Clone [SiGA](https://github.com/open-eid/SiGa)

- Set java version to 11

- Navigate to SiGA & run `./mvnw clean install`

- Navigate to SiGA & run `./mvnw spring-boot:build-image -pl siga-webapp`

- Copy docker folder from SiGA directory & paste it into current repo directory.

- Clone [SiGA Demo](https://github.com/open-eid/SiGa-demo-application)

- Set java version to 17

- Build demo docker image using `./mvnw spring-boot:build-image`

- Navigate to current repo and run `docker-compose $(find docker-* | sed -e 's/^/-f /') up -d`

- Go to https://localhost:3001

**Training Module GUI setup in Service Module**

- Clone [Training Module](https://github.com/buerokratt/Training-Module)
- Training Module `.env` file includes REACT_APP_SERVICE_MODULE_GUI_BASE_URL
- In Training Module run: `docker-compose up -d`
  - Training module uses the same network as Service Module

### Database setup

- For setting up the users database initially, run
  `docker run --platform linux/amd64 --network=bykstack riaee/byk-users-db:liquibase20220615 --url=jdbc:postgresql://database:5432/users_db --username=byk --password=01234 --changelog-file=./master.yml update`
- Run migrations added in this repository by running the helper script `./migrate.sh`
- When creating new migrations, use the helper `./create-migration.sh name-of-migration` which will create a timestamped file in the correct directory and add the required headers

### DataMapper

[Changes based on this example](https://github.com/express-handlebars/express-handlebars/tree/master/examples/advanced)

DataMapper directory:

- create new directory: **lib**

**Update server.js**

```
import * as helpers from "./lib/helpers.js";
```

```
const hbs = create(); -> const hbs = create({ helpers });
```

```
app.post('/hbs/*', (req, res) => {
  res.render(req.params[0], req.body, function (_, response) {
    if (req.get('type') === 'csv') {
      res.json({ response });
    } else if (req.get('type') === 'json') {
      res.json(JSON.parse(response));
    }
    res.render(req.params[0], req.body);
  });
});
```

To enable handlebars templates to receive a body and return a json

- When Building a handlebars template make sure to add `layout:false` so that hbs response in the data-mapper will discard the html layout and only return the body data

### DMapper helper functions

- Add all the helper functions to **DSL/DMapper/lib/helpers.js**

### DMapper problems

- http://data_mapper:3005/js/generate/pdf
  - Docker stops - PDF is not returned
- **Possible solution- replace Data Mapper Dockerfile content with the following:**

```
FROM node:19-alpine

RUN apk add --no-cache chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

ENV NODE_ENV development
WORKDIR /workspace/app/

COPY js js
COPY views views
COPY lib lib
COPY package.json .
COPY server.js .

RUN npm i -g npm@latest
RUN npm install
ENTRYPOINT ["npm","start"]
```

### Current dependencies problem

In order for the whole application logic to work, you need to use these specific PRs to support certain functionality until they get merged into main.

- Using pre defined config secrets depends on this [Datamapper PR](https://github.com/buerokratt/DataMapper/pull/11). Secrets under `secrets/` directory are mock data which can be replaced using volumes in docker compose
