# Bürokratt's Service Module

Bürokratt's Service Module is a tool to help primarily product owners in collaboration with customer support agents/service managers to create, edit and otherwise manipulate Bürokratt's e-services via a graphical user interface. This includes setting up Ruuter- and Rasa-based Rules, making X-road / REST / database requests where and when appropriate and so forth.

Service Module focuses on the part of creation of any service where Bürokratt users can define service endpoints (i.e API or X-Road) whereas Training Module focuses on Rasa's side.

# Scope

This repo will primarily contain:

1. Architectural and other documentation;
2. Docker Compose file to set up and run Bürokratt's Service Module as a fully functional service;
3. Tests specific to Bürokratt's Service Module.

## Dev setup

- Make sure that env variable REACT_APP_LOCAL is set to true(default).

- Clone [Ruuter](https://github.com/buerokratt/Ruuter)

- Navigate to Ruuter and build the image `docker build -t ruuter .`

- Clone [Resql](https://github.com/buerokratt/Resql)

- Navigate to Resql and build the image `docker build -t resql .`

- Clone [Data Mapper](https://github.com/buerokratt/DataMapper)

- Navigate to Data Mapper and build the image `docker build -t data-mapper .`

- Clone [TIM](https://github.com/buerokratt/TIM)

- Navigate to TIM and build the image `docker build -t tim .`

- Clone [SiGA](https://github.com/open-eid/SiGa)

- Set java version to 17

- Navigate to SiGA & run `./mvnw clean install`

- Navigate to SiGA & run `./mvnw spring-boot:build-image -pl siga-webapp -DskipTests`

- Copy docker folder from SiGA directory & paste it into current repo directory.

- Clone [SiGA Demo](https://github.com/open-eid/SiGa-demo-application)

- Build demo docker image using `./mvnw spring-boot:build-image -DskipTests`

- Navigate to current repo and run `./docker/tls/generate-certificates.sh`

- Navigate to current repo and run `docker-compose $(find docker-* | sed -e 's/^/-f /') up -d`

- Go to <https://localhost:3001>

**Training Module GUI setup in Service Module**

- Clone [Training Module](https://github.com/buerokratt/Training-Module)
- Training Module `.env` file includes REACT_APP_SERVICE_MODULE_GUI_BASE_URL
- In Training Module run: `docker-compose up -d`
  - Training module uses the same network as Service Module

Currently, Header and Main Navigation used as external components, they are defined as dependency in package.json

```
 "@buerokrat-ria/header": "^0.0.1"
 "@buerokrat-ria/menu": "^0.0.1"
 "@buerokrat-ria/styles": "^0.0.1"
```

### Database setup

To use the local services database, do the following:

1. Open `docker-compose.yml`, find `resql` service and change the value of environment variable `sqlms.datasources.[0].jdbcUrl` to `jdbc:postgresql://database:5432/services_db`.
2. Run `./migrate.sh` to run migrations.
3. Start the project normally with `docker compose up -d`.

Extras:

- For setting up the users database initially, run
  `docker run --platform linux/amd64 --network=bykstack riaee/byk-users-db:liquibase20220615 --url=jdbc:postgresql://database:5432/users_db --username=byk --password=01234 --changelog-file=./master.yml update`
- When creating new migrations, use the helper `./create-migration.sh name-of-migration` which will create a timestamped file in the correct directory and add the required headers

### Open Search

- To Initialize Open Search run `./deploy-opensearch.sh <URL> <AUTH> <Is Mock Allowed - Default false>`
- To Use Opensearch locally run `./deploy-opensearch.sh http://localhost:9200 admin:admin true`

### TIM

- if you are running `Locally` then you need to curl the login request or run it on postman first to create and store the cookie in TIM and then on the browser create the cookie manully in the browser with name `customJwtCookie` and the value return from the curl
  the curl request is as follows:

```
curl -X POST -H "Content-Type: application/json" -d '{
  "login": "EE30303039914",
  "password": "OK"
}' http://localhost:8086/services/auth/login
```

### Kubernetes deployment

For production deploying on kubernetes use this the variable [`REACT_APP_MENU_JSON`](https://github.com/buerokratt/NoOps/blob/dev/Kubernetes/Modules/Service-Module/templates/deployment-byk-services-gui.yaml) with the value:

```
"[{\"id\":\"conversations\",\"label\":{\"et\":\"Vestlused\",\"en\":\"Conversations\"},\"path\":\"/chat\",\"children\":[{\"label\":{\"et\":\"Vastamata\",\"en\":\"Unanswered\"},\"path\":\"/unanswered\"},{\"label\":{\"et\":\"Aktiivsed\",\"en\":\"Active\"},\"path\":\"/active\"},{\"label\":{\"et\":\"Ootel\",\"en\":\"Pending\"},\"path\":\"/pending\"},{\"label\":{\"et\":\"Ajalugu\",\"en\":\"History\"},\"path\":\"/history\"}]},{\"id\":\"training\",\"label\":{\"et\":\"Treening\",\"en\":\"Training\"},\"path\":\"/training\",\"children\":[{\"label\":{\"et\":\"Treening\",\"en\":\"Training\"},\"path\":\"/training\",\"children\":[{\"label\":{\"et\":\"Teemad\",\"en\":\"Themes\"},\"path\":\"/training/intents\"},{\"hidden\":true,\"label\":{\"et\":\"Avalikud teemad\",\"en\":\"Public themes\"},\"path\":\"/training/common-intents\"},{\"label\":{\"et\":\"Teemade järeltreenimine\",\"en\":\"Post training themes\"},\"path\":\"/training/intents-followup-training\"},{\"label\":{\"et\":\"Vastused\",\"en\":\"Answers\"},\"path\":\"/training/responses\"},{\"label\":{\"et\":\"Reeglid\",\"en\":\"Rules\"},\"path\":\"/training/rules\"},{\"hidden\":true,\"label\":{\"et\":\"Konfiguratsioon\",\"en\":\"Configuration\"},\"path\":\"/training/configuration\"},{\"label\":{\"et\":\"Vormid\",\"en\":\"Forms\"},\"path\":\"/training/forms\"},{\"label\":{\"et\":\"Mälukohad\",\"en\":\"Slots\"},\"path\":\"/training/slots\"},{\"hidden\":true,\"label\":{\"et\":\"Automatic Teenused\",\"en\":\"Automatic Services\"},\"path\":\"/auto-services\"}]},{\"label\":{\"et\":\"Ajaloolised vestlused\",\"en\":\"Historical conversations\"},\"path\":\"/history\",\"children\":[{\"label\":{\"et\":\"Ajalugu\",\"en\":\"History\"},\"path\":\"/history/history\"},{\"hidden\":true,\"label\":{\"et\":\"Pöördumised\",\"en\":\"Appeals\"},\"path\":\"/history/appeal\"}]},{\"label\":{\"et\":\"Mudelipank ja analüütika\",\"en\":\"Modelbank and analytics\"},\"path\":\"/analytics\",\"children\":[{\"label\":{\"et\":\"Teemade ülevaade\",\"en\":\"Overview of topics\"},\"path\":\"/analytics/overview\"},{\"label\":{\"et\":\"Mudelite võrdlus\",\"en\":\"Comparison of models\"},\"path\":\"/analytics/models\"},{\"hidden\":true,\"label\":{\"et\":\"Testlood\",\"en\":\"testTracks\"},\"path\":\"/analytics/testcases\"}]},{\"label\":{\"et\":\"Treeni uus mudel\",\"en\":\"Train new model\"},\"path\":\"/train-new-model\"}]},{\"id\":\"analytics\",\"label\":{\"et\":\"Analüütika\",\"en\":\"Analytics\"},\"path\":\"/analytics\",\"children\":[{\"label\":{\"et\":\"Ülevaade\",\"en\":\"Overview\"},\"path\":\"/overview\"},{\"label\":{\"et\":\"Vestlused\",\"en\":\"Chats\"},\"path\":\"/chats\"},{\"label\":{\"et\":\"Tagasiside\",\"en\":\"Feedback\"},\"path\":\"/feedback\"},{\"label\":{\"et\":\"Nõustajad\",\"en\":\"Advisors\"},\"path\":\"/advisors\"},{\"label\":{\"et\":\"Avaandmed\",\"en\":\"Reports\"},\"path\":\"/reports\"}]},{\"id\":\"services\",\"hidden\":true,\"label\":{\"et\":\"Teenused\",\"en\":\"Services\"},\"path\":\"/services\",\"children\":[{\"label\":{\"et\":\"Ülevaade\",\"en\":\"Overview\"},\"path\":\"/overview\"},{\"label\":{\"et\":\"Uus teenus\",\"en\":\"New Service\"},\"path\":\"/newService\"},{\"label\":{\"et\":\"Automatic Teenused\",\"en\":\"Automatic Services\"},\"path\":\"/auto-services\"},{\"label\":{\"et\":\"Probleemsed teenused\",\"en\":\"Faulty Services\"},\"path\":\"/faultyServices\"}]},{\"id\":\"settings\",\"label\":{\"et\":\"Haldus\",\"en\":\"Administration\"},\"path\":\"/settings\",\"children\":[{\"label\":{\"et\":\"Kasutajad\",\"en\":\"Users\"},\"path\":\"/users\"},{\"label\":{\"et\":\"Vestlusbot\",\"en\":\"Chatbot\"},\"path\":\"/chatbot\",\"children\":[{\"label\":{\"et\":\"Seaded\",\"en\":\"Settings\"},\"path\":\"/chatbot/settings\"},{\"label\":{\"et\":\"Tervitussõnum\",\"en\":\"Welcome message\"},\"path\":\"/chatbot/welcome-message\"},{\"label\":{\"et\":\"Välimus ja käitumine\",\"en\":\"Appearance and behavior\"},\"path\":\"/chatbot/appearance\"},{\"label\":{\"et\":\"Erakorralised teated\",\"en\":\"Emergency notices\"},\"path\":\"/chatbot/emergency-notices\"}]},{\"label\":{\"et\":\"Asutuse tööaeg\",\"en\":\"Office opening hours\"},\"path\":\"/working-time\"},{\"label\":{\"et\":\"Sessiooni pikkus\",\"en\":\"Session length\"},\"path\":\"/session-length\"}]},{\"id\":\"monitoring\",\"hidden\":true,\"label\":{\"et\":\"Seire\",\"en\":\"Monitoring\"},\"path\":\"/monitoring\",\"children\":[{\"label\":{\"et\":\"Aktiivaeg\",\"en\":\"Working hours\"},\"path\":\"/uptime\"}]}]"
```

like this:

```
            - name: REACT_APP_MENU_JSON
              value: "[{\"id\":\"conversations\",\"label\":{\"et\":\"Vestlused\",\"en\":\"Conversations\"},\"path\":\"/chat\",\"children\":[{\"label\":{\"et\":\"Vastamata\",\"en\":\"Unanswered\"},\"path\":\"/unanswered\"},{\"label\":{\"et\":\"Aktiivsed\",\"en\":\"Active\"},\"path\":\"/active\"},{\"label\":{\"et\":\"Ootel\",\"en\":\"Pending\"},\"path\":\"/pending\"},{\"label\":{\"et\":\"Ajalugu\",\"en\":\"History\"},\"path\":\"/history\"}]},{\"id\":\"training\",\"label\":{\"et\":\"Treening\",\"en\":\"Training\"},\"path\":\"/training\",\"children\":[{\"label\":{\"et\":\"Treening\",\"en\":\"Training\"},\"path\":\"/training\",\"children\":[{\"label\":{\"et\":\"Teemad\",\"en\":\"Themes\"},\"path\":\"/training/intents\"},{\"hidden\":true,\"label\":{\"et\":\"Avalikud teemad\",\"en\":\"Public themes\"},\"path\":\"/training/common-intents\"},{\"label\":{\"et\":\"Teemade järeltreenimine\",\"en\":\"Post training themes\"},\"path\":\"/training/intents-followup-training\"},{\"label\":{\"et\":\"Vastused\",\"en\":\"Answers\"},\"path\":\"/training/responses\"},{\"label\":{\"et\":\"Reeglid\",\"en\":\"Rules\"},\"path\":\"/training/rules\"},{\"hidden\":true,\"label\":{\"et\":\"Konfiguratsioon\",\"en\":\"Configuration\"},\"path\":\"/training/configuration\"},{\"label\":{\"et\":\"Vormid\",\"en\":\"Forms\"},\"path\":\"/training/forms\"},{\"label\":{\"et\":\"Mälukohad\",\"en\":\"Slots\"},\"path\":\"/training/slots\"},{\"hidden\":true,\"label\":{\"et\":\"Automatic Teenused\",\"en\":\"Automatic Services\"},\"path\":\"/auto-services\"}]},{\"label\":{\"et\":\"Ajaloolised vestlused\",\"en\":\"Historical conversations\"},\"path\":\"/history\",\"children\":[{\"label\":{\"et\":\"Ajalugu\",\"en\":\"History\"},\"path\":\"/history/history\"},{\"hidden\":true,\"label\":{\"et\":\"Pöördumised\",\"en\":\"Appeals\"},\"path\":\"/history/appeal\"}]},{\"label\":{\"et\":\"Mudelipank ja analüütika\",\"en\":\"Modelbank and analytics\"},\"path\":\"/analytics\",\"children\":[{\"label\":{\"et\":\"Teemade ülevaade\",\"en\":\"Overview of topics\"},\"path\":\"/analytics/overview\"},{\"label\":{\"et\":\"Mudelite võrdlus\",\"en\":\"Comparison of models\"},\"path\":\"/analytics/models\"},{\"hidden\":true,\"label\":{\"et\":\"Testlood\",\"en\":\"testTracks\"},\"path\":\"/analytics/testcases\"}]},{\"label\":{\"et\":\"Treeni uus mudel\",\"en\":\"Train new model\"},\"path\":\"/train-new-model\"}]},{\"id\":\"analytics\",\"label\":{\"et\":\"Analüütika\",\"en\":\"Analytics\"},\"path\":\"/analytics\",\"children\":[{\"label\":{\"et\":\"Ülevaade\",\"en\":\"Overview\"},\"path\":\"/overview\"},{\"label\":{\"et\":\"Vestlused\",\"en\":\"Chats\"},\"path\":\"/chats\"},{\"label\":{\"et\":\"Tagasiside\",\"en\":\"Feedback\"},\"path\":\"/feedback\"},{\"label\":{\"et\":\"Nõustajad\",\"en\":\"Advisors\"},\"path\":\"/advisors\"},{\"label\":{\"et\":\"Avaandmed\",\"en\":\"Reports\"},\"path\":\"/reports\"}]},{\"id\":\"services\",\"hidden\":true,\"label\":{\"et\":\"Teenused\",\"en\":\"Services\"},\"path\":\"/services\",\"children\":[{\"label\":{\"et\":\"Ülevaade\",\"en\":\"Overview\"},\"path\":\"/overview\"},{\"label\":{\"et\":\"Uus teenus\",\"en\":\"New Service\"},\"path\":\"/newService\"},{\"label\":{\"et\":\"Automatic Teenused\",\"en\":\"Automatic Services\"},\"path\":\"/auto-services\"},{\"label\":{\"et\":\"Probleemsed teenused\",\"en\":\"Faulty Services\"},\"path\":\"/faultyServices\"}]},{\"id\":\"settings\",\"label\":{\"et\":\"Haldus\",\"en\":\"Administration\"},\"path\":\"/settings\",\"children\":[{\"label\":{\"et\":\"Kasutajad\",\"en\":\"Users\"},\"path\":\"/users\"},{\"label\":{\"et\":\"Vestlusbot\",\"en\":\"Chatbot\"},\"path\":\"/chatbot\",\"children\":[{\"label\":{\"et\":\"Seaded\",\"en\":\"Settings\"},\"path\":\"/chatbot/settings\"},{\"label\":{\"et\":\"Tervitussõnum\",\"en\":\"Welcome message\"},\"path\":\"/chatbot/welcome-message\"},{\"label\":{\"et\":\"Välimus ja käitumine\",\"en\":\"Appearance and behavior\"},\"path\":\"/chatbot/appearance\"},{\"label\":{\"et\":\"Erakorralised teated\",\"en\":\"Emergency notices\"},\"path\":\"/chatbot/emergency-notices\"}]},{\"label\":{\"et\":\"Asutuse tööaeg\",\"en\":\"Office opening hours\"},\"path\":\"/working-time\"},{\"label\":{\"et\":\"Sessiooni pikkus\",\"en\":\"Session length\"},\"path\":\"/session-length\"}]},{\"id\":\"monitoring\",\"hidden\":true,\"label\":{\"et\":\"Seire\",\"en\":\"Monitoring\"},\"path\":\"/monitoring\",\"children\":[{\"label\":{\"et\":\"Aktiivaeg\",\"en\":\"Working hours\"},\"path\":\"/uptime\"}]}]"
```

## Code quality

### Formatting

```bash
npm run format         # Check if the code is formatted, without making changes
npm run format:fix     # Format the code
```

### Linting

```bash
npm run lint           # Check for linting issues, without making changes
npm run lint:fix       # Automatically fix linting issues
```

### Tests

Tests are written in TypeScript (and the project should be migrated to TypeScript in the future too). Available npm scripts:

```bash
npm test               # Run tests in watch mode
npm run test:run       # Run tests once
npm run test:coverage  # Run tests with coverage
```

### SQL

The repository uses [SQLFluff](https://sqlfluff.com/) for linting and formatting SQL files. To use SQLFluff:

1. Install SQLFluff: `pipx install sqlfluff`.
2. Run `sqlfluff lint <some-path>`.
3. Additionally, using an IDE extension is highly recommended. For [VSCode](https://marketplace.visualstudio.com/items?itemName=dorzey.vscode-sqlfluff) or [Jetbrains editors](https://plugins.jetbrains.com/plugin/20494-sqlfluff-linter-community-edition).

## Environment variables

| Ruuter Variable                    | GUI Variable                               | Description                                          | Required | Default Value       |
| ---------------------------------- | ------------------------------------------ | ---------------------------------------------------- | -------- | ------------------- |
| `application.apiRequestTestingKey` | `REACT_APP_RUUTER_SERVICES_TESTING_HEADER` | `x-ruuter-testing` header value for testing services |          | `voorshpellhappilo` |

## Intent classification

### Blob Storage & Indexing

Intent files are published to Azure Blob Storage and indexed for LLM-based intent detection. Each intent file is stored as a separate blob. The behavior differs between `edit.yml` and `status.yml`:

**In `edit.yml`:**

- Blob storage operations occur **only when the service state is being set to 'active'**
- When a service is edited and the state is set to 'active', the intent file (JSON format) is uploaded or updated in Azure Blob Storage using Storage Ferry
- The file is stored with the service name as the filename (e.g., `service-name.json`)

**In `status.yml`:**

- When a service is **activated** (state changed to 'active'): the intent file is created in blob storage
- When a service is **deactivated** (state changed to inactive): the intent file is deleted from blob storage

**Blob storage operations:**

The Storage Ferry service is used to upload the intent file to Azure Blob Storage. The ferry operation is documented in detail in the [Storage Ferry README](https://github.com/buerokratt/S3-Ferry/blob/dev/README.md#endpoints).

The following variables need to be configured in the `constants.ini` file:

| Variable                    | Description                                          | Required | Default Value |
| --------------------------- | ---------------------------------------------------- | -------- | ------------- |
| `STORAGE_FERRY_ACCOUNT_ID`  | Azure storage account ID for Storage Ferry service. For local development, uses Azurite (Azure emulator) | Yes      |               |
| `STORAGE_FERRY_CONTAINER`   | Azure storage container name for Storage Ferry service. For local development, uses Azurite (Azure emulator) | Yes      |               |

**Note:** For local development, `STORAGE_FERRY_ACCOUNT_ID` and `STORAGE_FERRY_CONTAINER` use Azurite (Azure Storage emulator) as configured in `docker-compose.yml`. Files are created in the local Azurite instance.

**Azure Search Indexing:**

After each blob storage operation (create, update, or delete), the Azure Search indexer is automatically triggered to index the updated data. This ensures that the LLM has access to the latest service definitions for intent classification.

The following variables need to be configured in the `constants.ini` file:

| Ruuter Variable            | Description                                          | Required | Default Value |
| -------------------------- | ---------------------------------------------------- | -------- | ------------- |
| `AZURE_SEARCH_SERVICE_NAME` | Azure Search service name for indexer API            |          |               |
| `AZURE_SEARCH_INDEXER_NAME` | Azure Search indexer name to trigger after storage operations |          |               |
| `AZURE_SEARCH_API_KEY`      | Azure Search API key for authentication              |          |               |

**Note:** If `AZURE_SEARCH_SERVICE_NAME`, `AZURE_SEARCH_INDEXER_NAME`, or `AZURE_SEARCH_API_KEY` are missing or empty, a warning will be logged and the Azure Search indexer will not be triggered. The operation will continue normally without updating the indexer.

## LLM Classification Contract

### Input format

The LLM receives a sequence of messages and parameters designed to:
- Provide system-level instructions and constraints
- Pass the actual user input for classification
- Fine tune used model for classification.

---

### Message Flow

The intent classification request consists of **two messages**, that define processing rules, behavior and user input, followed by configurable set of parameters.

#### 1. Request

Array of messages consists of 2 objects with following structure:

````
{
  "role":"role name system/user",
  "content":"input"
}
````

- **System message**: Defines how the LLM should behave, including processing instructions, allowed intent outputs, and the current date.
- **User message**: Contains the raw input provided by the end user (via widget) and represents the content analyzed by the LLM to determine intent.
- Rest is configuration elements.

Example body:
```` 
 {
    "messages": [
        {
            "role": "system",
            "content": "You are a precise intent classifier and entity extractor.\n\nYou will receive:\n- A user query.\n- A set of retrieved intents (each with an `id`, `name`, `description`, `examples`, and `entities`).\n\nYou will output:\n- The retrieved intent ID.\n- Extracted entities (**only** if defined in the retrieved intent).\n\nYour goal:\nDetermine whether the user query matches one of the retrieved intents. If it does, return that intent's ID and any required entities. Since your output directly triggers backend services, it is **critical** that you **only** output intents and entities that exist in the retrieved data, and **never** generate new ones.\n\nYour task:\n1. Identify the single best-matching intent **only** from the retrieved intents.\n2. You must never invent or create new intent IDs or names.\n3. If none of the retrieved intents clearly match, return the special intent ID `\"OOD\"`.\n4. Extract only the entities listed in the selected intent’s `entities` array.\n5. Do not infer or create additional entities that are not listed.\n6. If an expected entity is not present in the query, set its value to `null`.\n7. For each extracted entity, return the canonical (nominative) form (e.g., if the user says \"Tartus\", return \"Tartu\").\n\nRules:\n- Only use entity names explicitly listed in the retrieved intent’s `entities` array.\n- Ignore any extra information (e.g., dates, times, years) not part of the listed entities.\n- If an entity listed in the `entities` array cannot be extracted, set its value to `null`.\n- Return **only** valid JSON. No text, comments, or explanations.\n- The `\"intent\"` field must exactly match one of the retrieved intent IDs or be `\"OOD\"`.\n\nStrict output format:\n{\n  \"intent\": \"<intent_id or 'OOD'>\",\n  \"entities\": {\n    \"<entity_name>\": \"<value or null>\"\n  }\n}\n\nIf your output does not strictly follow this JSON schema, it will be rejected. The current date is 2025-12-05"
        },
        {
            "role": "user", 
            "content": "mis ilm on Tartus?"
        }
    ],
    "max_tokens": 800,
    "temperature": 0,
    "top_p": 1,
    "stream": false,
    "frequency_penalty": 0,
    "presence_penalty": 0,
    "data_sources": [
        {
            "type": "azure_search",
            "parameters": {
                "endpoint": "https://buerokratt.search.windows.net",
                "in_scope": false,
                "top_n_documents": 3,
                "semantic_configuration": "teenused-index-semantic-configuration",
                "strictness": 3,
                "query_type": "vector_semantic_hybrid",
                "index_name": "teenused-index",
                "embedding_dependency": {
                    "type": "endpoint",
                    "endpoint": "classification endpoint",
                    "authentication": {
                        "type": "api_key",
                        "key": "your_api_key"
                    }
                },
                "authentication": {
                    "type": "api_key",
                    "key": "your_auth_api_key"
                }
            }
        }
    ]
}
````

## Routing Logic

# 8. API Contracts

This section defines the API contracts exposed by the system.

The following APIs are documented:
- Classification Endpoint
- Routing / Validation Endpoint

---

## 8.1 Intent CRUD APIs

### Create Intent

**Method:** `POST`  
**Endpoint:** `/api/intents`

#### Request Body
```json
{
  "name": "string",
  "description": "string",
  "trainingPhrases": ["string"]
}