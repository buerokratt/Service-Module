**AS A** developer

**I WANT** to use UPDATE and DELETE statements in SQL queries

**SO THAT I** can modify and remove data directly without using the INSERT-based workaround pattern, and prevent the database from ballooning in size needlessly

## Acceptance criteria

The following changes are implemented:

- [x] Remove the restriction on UPDATE and DELETE statements from **this** project documentation and rules
- [x] Review existing SQL files that use the INSERT workaround pattern and consider refactoring them to use UPDATE/DELETE where appropriate
- [ ] Ensure all team members are aware of this change

### SQL Files to Refactor

The following SQL files use the INSERT-based workaround pattern and should be refactored to use UPDATE/DELETE statements:

- [x] `DSL/Resql/services/POST/edit.sql` - Updates service details
- [x] `DSL/Resql/services/POST/set-status.sql` - Updates service status
- [x] `DSL/Resql/services/POST/delete-service.sql` - Marks service as deleted
- [x] `DSL/Resql/services/POST/endpoints/delete_endpoint.sql` - Marks endpoint as deleted
- [x] `DSL/Resql/services/POST/endpoints/delete_endpoints_by_service_id.sql` - Marks multiple endpoints as deleted
- [x] `DSL/Resql/services/POST/endpoints/update_endpoint.sql` - Updates endpoint details
- [x] `DSL/Resql/services/POST/endpoints/remove_endpoint_from_preferences.sql` - Removes endpoint from user step preferences
- [x] `DSL/Resql/services/POST/endpoints/remove_service_endpoints_from_preferences.sql` - Removes service endpoints from user step preferences
- [x] `DSL/Resql/services/POST/update-user-step-preferences.sql` - Updates user step preferences
- [x] `DSL/Resql/services/POST/update-settings.sql` - Updates service settings

**Note:** Training database queries (`DSL/Resql/training/`) still use the INSERT pattern and are not being refactored.

## Context

Previously, the project had a requirement to avoid UPDATE and DELETE statements in SQL, requiring developers to use INSERT statements with SELECT from existing records as a workaround. This restriction is now being removed to allow more standard SQL operations and prevent the database from growing unnecessarily large due to the accumulation of historical records from the INSERT-based modification pattern.

Agreed on call with Ahmed, Varmo, Janno.

**Strong suggestion to star working on this after [this](https://github.com/buerokratt/Service-Module/issues/801) and [this](https://github.com/buerokratt/Service-Module/issues/798) are merged.** But **before** Service Module goes live.

## Testing

After refactoring the SQL files, the following functionality should be tested:

- [ ] **Edit Service** (`edit.sql`)
  - Edit service name, description, slot, examples, entities, structure, and common flag
  - Verify service details are updated correctly
  - Verify service can be edited multiple times
  - Verify only one record exists per service_id (no duplicates)

- [ ] **Change Service Status** (`set-status.sql`)
  - Change service status from draft → ready
  - Change service status from ready → active
  - Change service status from active → inactive
  - Change service status from inactive → draft
  - Verify status changes are reflected correctly in the UI
  - Verify only one record exists per service_id (no duplicates)

- [ ] **Delete Service** (`delete-service.sql`)
  - Delete a service in draft state
  - Delete a service in ready state
  - Verify active services cannot be deleted (should show error)
  - Verify deleted service is marked as deleted (deleted = TRUE)
  - Verify deleted service no longer appears in service lists
  - Verify only one record exists per service_id (no duplicates)

- [ ] **Update Endpoint** (`update_endpoint.sql`)
  - Update endpoint name, type, isCommon flag, serviceId, and definitions
  - Verify endpoint details are updated correctly
  - Verify endpoint can be updated multiple times
  - Verify only one record exists per endpoint_id (no duplicates)

- [ ] **Delete Single Endpoint** (`delete_endpoint.sql`, `remove_endpoint_from_preferences.sql`)
  - Delete an endpoint from a service
  - Verify endpoint is marked as deleted (deleted = TRUE)
  - Verify endpoint is removed from all user step preferences that reference it
  - Verify endpoint no longer appears in endpoint lists
  - Verify only one record exists per endpoint_id (no duplicates)

- [ ] **Delete Multiple Endpoints** (`delete_endpoints_by_service_id.sql`, `remove_service_endpoints_from_preferences.sql`)
  - Delete a service that has multiple endpoints
  - Verify all non-common service endpoints are marked as deleted
  - Verify all deleted endpoints are removed from user step preferences
  - Verify endpoints no longer appear in endpoint lists
  - Verify only one record exists per endpoint_id (no duplicates)

- [ ] **Update User Step Preferences** (`update-user-step-preferences.sql`)
  - Update user step preferences (steps and endpoints arrays)
  - Verify preferences are updated correctly
  - Verify preferences can be updated multiple times
  - Verify only the latest preference record is updated

- [ ] **Update Service Settings** (`update-settings.sql`)
  - Update service settings (name-value pairs)
  - Verify settings are updated correctly
  - Verify settings can be updated multiple times
  - Verify only the latest setting record is updated per setting name
