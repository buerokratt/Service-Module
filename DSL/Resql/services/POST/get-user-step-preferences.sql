WITH latest_steps AS (
    SELECT 
        step,
        "ordinality",
        active,
        pinned,
        created_at,
        ROW_NUMBER() OVER (
            PARTITION BY user_id_code, step 
            ORDER BY created_at DESC
        ) AS rn
    FROM user_step_preference
)
SELECT 
    step,
    "ordinality",
    active,
    pinned
FROM latest_steps
WHERE rn = 1
ORDER BY 
    "ordinality",
    created_at DESC;
