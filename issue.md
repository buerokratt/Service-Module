**AS A** developer

**I WANT** to use UPDATE and DELETE statements in SQL queries

**SO THAT I** can modify and remove data directly without using the INSERT-based workaround pattern, and prevent the database from ballooning in size needlessly

## Acceptance criteria

The following changes are implemented:

- [x] Remove the restriction on UPDATE and DELETE statements from **this** project documentation and rules
- [x] Review existing SQL files that use the INSERT workaround pattern and consider refactoring them to use UPDATE/DELETE where appropriate
- [ ] Ensure all team members are aware of this change

### SQL Files Refactored

**UPDATE/DELETE queries:**

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

**SELECT queries:**

- [x] `DSL/Resql/services/POST/get-service-by-id.sql` - Gets service by ID
- [x] `DSL/Resql/services/POST/get-services-list.sql` - Gets list of services
- [x] `DSL/Resql/services/POST/get-common-services-list.sql` - Gets list of common services
- [x] `DSL/Resql/services/POST/services/check_name_exist.sql` - Checks if service name exists
- [x] `DSL/Resql/services/POST/status.sql` - Gets service status
- [x] `DSL/Resql/services/POST/get-service-name-by-id.sql` - Gets service name by ID
- [x] `DSL/Resql/services/POST/get-settings.sql` - Gets service settings
- [x] `DSL/Resql/services/POST/endpoints/get_endpoints_by_service_id.sql` - Gets endpoints by service ID
- [x] `DSL/Resql/services/POST/endpoints/get_common_endpoints.sql` - Gets common endpoints
- [x] `DSL/Resql/services/POST/services/get_services_by_ids.sql` - Gets services by IDs
- [x] `DSL/Resql/services/POST/get-user-step-preferences.sql` - Gets user step preferences

**Note:** Training database queries (`DSL/Resql/training/`) still use the INSERT pattern and are not being refactored.

## Context

Previously, the project had a requirement to avoid UPDATE and DELETE statements in SQL, requiring developers to use INSERT statements with SELECT from existing records as a workaround. This restriction is now being removed to allow more standard SQL operations and prevent the database from growing unnecessarily large due to the accumulation of historical records from the INSERT-based modification pattern.

Agreed on call with Ahmed, Varmo, Janno.

**Strong suggestion to star working on this after [this](https://github.com/buerokratt/Service-Module/issues/801) and [this](https://github.com/buerokratt/Service-Module/issues/798) are merged.** But **before** Service Module goes live.

## Testing

After refactoring the SQL files, the following functionality should be tested:

**UPDATE/DELETE operations:**

- [ ] **Edit Service** - Verify service details can be updated correctly. Test with normal and common services.
- [ ] **Change Service Status** - Verify status changes work (draft → ready → active → inactive)
- [ ] **Delete Service** - Verify services can be deleted and active services show error
- [ ] **Update Endpoint** - Verify endpoint details can be updated correctly
- [ ] **Delete Single Endpoint** - Verify endpoint deletion and removal from user preferences
- [ ] **Delete Multiple Endpoints with service** - Verify all service endpoints are deleted when service is deleted
- [ ] **Update User Preferences** - Verify user preferences can be updated: endpoint order (API elements) and step type order (All elements)

**SELECT queries:**

- [ ] **Get Service by ID** - Verify service details are retrieved correctly
- [ ] **Get Services List** - Verify services list is displayed correctly with pagination and sorting
- [ ] **Get Common Services List** - Verify common services list is displayed correctly
- [ ] **Check Service Name Exists** - Verify name existence check works correctly
- [ ] **Get Service Status** - Verify service status is retrieved correctly
- [ ] **Get Service Name by ID** - Verify service name is retrieved correctly
- [ ] **Get Service Settings** - Verify service settings are retrieved correctly
- [ ] **Get Endpoints by Service ID** - Verify endpoints are retrieved and ordered by user preferences
- [ ] **Get Common Endpoints** - Verify common endpoints are retrieved correctly
- [ ] **Get Services by IDs** - Verify multiple services are retrieved correctly
- [ ] **Get User Step Preferences** - Verify user step preferences are retrieved correctly
