CREATE TABLE user_entity (id text, first_name text, last_name text, email text, username text, email_verified boolean, created_timestamp bigint, realm_id text);
CREATE TABLE credential (user_id text, secret_data text, credential_data text);
INSERT INTO user_entity VALUES ('fixture-id','Fixture','Family','fixture@example.com','fixture',true,1634670076567,'RealmID'), ('outside-id','Other','Realm','outside@example.com','outside',true,0,'OtherRealm');
INSERT INTO credential VALUES ('fixture-id','{"value":"fixture-hash","salt":"fixture-salt"}','{"hashIterations":27500,"algorithm":"pbkdf2-sha256"}'), ('outside-id','{"value":"outside-hash","salt":"outside-salt"}','{"hashIterations":27500,"algorithm":"pbkdf2-sha256"}');
CREATE SCHEMA auth;
CREATE TABLE auth.users (id text, instance_id text, encrypted_password text, created_at timestamptz);
CREATE TABLE auth.identities (user_id text, provider text, email text);
INSERT INTO auth.users VALUES ('fixture-local','instance-id','$2a$12$1234567890123456789012abcdefghijklmnopqrstuvwxyza','2024-01-11T09:54:59Z'),('fixture-social','instance-id','','2024-01-11T09:54:59Z');
INSERT INTO auth.identities VALUES ('fixture-local','email','local@example.com'),('fixture-social','google','social@example.com');
