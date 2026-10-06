# Displayed migration-source snapshots

These are manually copied passages displayed by keycloak, supabase migration guides, retrieved on 2026-10-04. The maintained repositories remain the source of truth; this collection is not published back to them. Only displayed source is included, not runnable migration projects.

Guides preserve the source languages and existing titles. CRLF is normalized to LF, trailing whitespace is removed, and a final newline is added. No other source changes are made.

| Local file | Pinned source (entire displayed file) | SHA-256 of local snapshot |
|---|---|---|
| `keycloak-mysql.sql` | [FusionAuth/fusionauth-import-scripts: keycloak/keycloak-export.sql](https://github.com/FusionAuth/fusionauth-import-scripts/blob/e51a12a21af15bba3554588ce950597dddaf0cbd/keycloak/keycloak-export.sql) | `d28a26227d27b0c53bb2c3cc956b624f494f5fae0184cb3934d9b31fd58851e8` |
| `keycloak-postgres.sql` | [FusionAuth/fusionauth-import-scripts: keycloak/keycloak-export-postgres.sql](https://github.com/FusionAuth/fusionauth-import-scripts/blob/e51a12a21af15bba3554588ce950597dddaf0cbd/keycloak/keycloak-export-postgres.sql) | `2ae453e79660d2ac60b533f04ef82e3447f9299ba5918c6d34598c90397bc092` |
| `supabase-export.sql` | [FusionAuth/fusionauth-import-scripts: supabase/supabase_user_migration_script.sql](https://github.com/FusionAuth/fusionauth-import-scripts/blob/e51a12a21af15bba3554588ce950597dddaf0cbd/supabase/supabase_user_migration_script.sql) | `3e35939ce2a63bef98bbde671f15a635bd736de0721fc445c9ade4eca2fc1361` |

## Verification

Run `bash tests/test.sh` with Python 3 and Docker. This verifies all three pinned files and runs the exact Keycloak PostgreSQL and Supabase SQL against isolated PostgreSQL 16 fixture schemas. The disposable container exposes no host ports and is removed after the test. Keycloak MySQL execution and real provider databases/imported-user login are not covered.
