-- Seed default user step preferences
-- Uses WHERE NOT EXISTS to prevent race condition: if multiple requests arrive simultaneously
-- and both see no preferences, only one will insert, preventing duplicate records
INSERT INTO user_step_preference (user_id_code, steps)
SELECT :user_id_code, '{assign,textfield,condition,multi-choice-question,dynamic-choices,finishing-step-end,input,auth,open-webpage,file-generate,file-sign,finising-step-redirect,rasa-rules,siga}'::step_type[]
WHERE NOT EXISTS (
  SELECT 1 FROM user_step_preference WHERE user_id_code = :user_id_code
)
