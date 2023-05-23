CREATE OR REPLACE FUNCTION ufn_get_user_migration_data_json() 
RETURNS table (j json) AS
$$

BEGIN
  RETURN QUERY
    SELECT array_to_json(array_agg(json_strip_nulls(row_to_json(r)))) 
    FROM 
    (SELECT 
      u.instance_id, 
      u.encrypted_password, 
      EXTRACT(EPOCH from u.created_at)*1000 as created_at, 
      i.provider, 
      i.email, 
      CASE WHEN u.encrypted_password = '' THEN i.provider||'|'||i.user_id
                ELSE 'auth0'||'|'||i.user_id
          END as "user_id",
      CASE WHEN u.encrypted_password = '' THEN null
                ELSE substring(u.encrypted_password,5,2)
          END as "factor",
      substring(u.encrypted_password,8,22) as salt,
      CASE WHEN u.encrypted_password = '' THEN 'hasprovider'
                ELSE substring(u.encrypted_password,30,31)
          END as "password",
      CASE WHEN u.encrypted_password = '' THEN null
                ELSE 'bcrypt'
          END as "encryptionScheme",
      '955a8687-0376-45cb-2f49-26e66050dea2' as "tenant",  -- provide your tenant id here from FusionAuth       
      true as email_verified
    FROM auth.users u JOIN auth.identities i 
    ON u.id = i.user_id
    ) r;
END;
$$ LANGUAGE plpgsql;


-- to run the function when created, SELECT "ufn_get_user_migration_data_json"();
