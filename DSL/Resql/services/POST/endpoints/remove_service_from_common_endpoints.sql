-- This operation is no longer needed since we now have single service_id instead of array
-- When removing a service from a common endpoint, we would need to create a new endpoint
-- with a different service_id, but this logic needs to be rethought based on business requirements
-- For now, this query will not perform any operation
SELECT NULL; 
-- todo igor check this