-- Remove a specific endpoint from all user step preferences
-- This is called when an endpoint is deleted to clean up references

UPDATE user_step_preference
SET endpoints = array_remove(endpoints, :endpoint_id::uuid)
WHERE endpoints @> ARRAY[:endpoint_id::uuid];