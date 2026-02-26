# Intent classification

## 1. System Flow

### 1.2 Dependencies
- Public Ruuter(DSLS from chatbot, SERVICE MODULE)
- Service Module
- LLM Configuration
- RESQL(Service message configuration value is held in database)
- Widget

---

## 2. Intent Data specification

---

## 3. Blob Storage & Indexing

Intent files are published to Azure Blob Storage and indexed for LLM-based intent detection. Each intent file is stored as a separate blob. The behavior differs between `edit.yml` and `status.yml`:

**In `edit.yml`:**

- When a service is edited and the state is set to **'active'**, the intent file (JSON format) is uploaded or updated in Azure Blob Storage using Storage Ferry
- When a service is edited and the state is changed **from active to draft or ready** (or any other non-active status), the intent file is deleted from blob storage
- The file is stored with the service name as the filename (e.g., `service-name.json`)

**In `status.yml`:**

- When a service is **activated** (state changed to 'active'): the intent file is created in blob storage
- When a service changes **from active to any other status** (e.g. inactive or draft): the intent file is deleted from blob storage

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

---

## 4. LLM Classification Contract

### Input format

The LLM receives a sequence of messages and parameters designed to:
- Provide system-level instructions and constraints
- Pass the actual user input for classification
- Fine tune used model for classification.


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

### Important note !!!
In current implementation the system message is stored in DATABASE as its content is hard to process for our environment.
id_system_message is the key by which we should receive the system message from database and pass it to the api call.

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
LLM specific configurations:

| Ruuter Variable            | Description                                                      | Required | Default Value |
| -------------------------- |------------------------------------------------------------------|----------|---------------|
| `ID_STRICTNESS` | Strictness parameter                                             | yes | 3             |
| `ID_MAX_TOKENS` | Maximum tokens use param                                         | yes | 1000          |
| `ID_DOCUMENTS`      | Top number of documents param                                    | yes | 5             |
| `ID_INDEX_NAME` | Stores vectors and data about possible intents, and other anchors | yes |               |
| `ID_QUERY_TYPE`      | Define how to query form index(vector/semantic/...)              | yes |               |
| `ID_SEARCH_ENDPOINT` | Search endpoint                                                  | yes |               |
| `ID_COMPLETION_ENDPOINT`      | Completion model endpoint(where llm call goes)                   | yes |               |
| `ID_CHATBOT_EXTERNAL_KEY` | Model API key                                                    | yes |               |
| `ID_EMBEDDED_ENDPOINT_AZURE`      | End point for embeddings                                         | yes |               |
| `ID_CHATBOT_EXTERNAL_API_KEY` | Key provided in headers for completion url                       | yes |               |
| `ID_CHATBOT_EXTERNAL_BOT_URL`      | External endpoint                                                | yes |               |
| `ID_SEMANTIC_CONFIGURATION` | Configure how indexing should be processed                       | yes |               |
| `ID_IN_SCOPE`      | Should use documents in scope or not                             | yes | false         |
| `ID_STREAM` | Should use streaming response                                    | yes | false         |
| `ID_ACTIVE`      | Enable/Disable llm proccessing                                   | yes | false         |

Do not skip any settings as they affect the accuracy of intent detection.
If ID_ACTIVE set to false then the Intent Classification DSL would not be triggered at all.

#### INTENT FOUND RESPONSE
```
{
    ...
    choices: [
        {
            ...
            message: {
                ...
                content: {
                    ...
                    "{\n  \"intent\": \"wather_location\",\n  \"entities\": {\"Location\":\"Tartu\"}\n}",
                    ...
                }
            }
        }
    ]
    ...
}
```


#### INTENT NOT FOUND RESPONSE
```
{
    ...
    choices: [
        {
            ...
            message: {
            ...
                content: {
                    ...
                    "{\n  \"intent\": \"OOD\",\n  \"entities\": {}\n}",
                    ...
                }
            }
        }
    ]
    ...
}
```
Responses are bigger and contain more information, I highlighted the important areas, that contain INTENT part.

If LLM response was malformed or incorrect then would be triggered an `SKIP` step that would not process llm response due to its incorrect response, stop all further executions in regard to llm and will resume the natural flow

When we have a proper response, then we proceed to next step where it checks the content for intent:

- If intent : `OOD` we trigger skip and stop processing LLM.
- If intent: not `OOD` but another name, we start validating process.


---

## 5. Routing Logic

After receiving response from LLM, then DSL would proceed to validation steps.
Response part that we will process is strictly configured to be of certain structure described earlier.
Any error would cause to skip processing of llm call.



### 5.1 Intent validation
- After LLM gives a response and intent detected is not `OOD` we can validate.
Detected intent should match a service name precisely.So we will check against a DATABASE for a match where `detected intent = service name` and its latest status is `active`.
This means that we have a valid service to be triggered.

### 5.2 Fall back
- If no valid intend found or LLM response is `OOD` we trigger the `SKIP` step in DSL which would stop LLM processing and resume the regular flow.

---

## 6. Entity Handling

Current iteration is simple and would be extended with further improvements.

- Entities are mapped and passed as array of value where's they used in order: 
```
    { "Location": "Tartu"}
```
In this scenario we will pass just `Tartu`. When we will get to the more complex implementation and do enchantments this section should be also updated.

Currently, we had low test sample size during development making testing results to be hard and inconsistent.

---

## 7. Logging & Error model

### 7.1 Blob Storage / Indexing
- Information could be found here:  [Storage Ferry README](https://github.com/buerokratt/S3-Ferry/blob/dev/README.md#endpoints).

---

## 8. API Contracts

### 8.2 Blob/Indexing api
- Additional information is located here:  [Storage Ferry README](https://github.com/buerokratt/S3-Ferry/blob/dev/README.md#endpoints).


### Follow-up note.

As in its current iteration we have only basic MVP version, some aspects of this procedure are still raw and inconsistent, and with its development this document should be updated accordingly.
