"""Run exact displayed SQL in a disposable PostgreSQL 16 container, fixtures only."""
import json
from pathlib import Path
import subprocess
import time
import uuid

NAME = "migration-database-fixtures-" + uuid.uuid4().hex[:12]
HERE = Path(__file__).resolve().parent
SNAPSHOTS = str(HERE.parent)

def docker(*args, check=True):
    return subprocess.run(["docker", *args], check=check, capture_output=True, text=True)

def sql(*args):
    return docker("exec", NAME, "psql", "-U", "postgres", "-v", "ON_ERROR_STOP=1", *args).stdout

# Verify this worker's exact disposable name is absent before creating it.
if docker("inspect", NAME, check=False).returncode == 0:
    raise SystemExit("Disposable test container already exists; refusing to replace it")
docker("run", "--rm", "-d", "--name", NAME, "--network", "none", "-e", "POSTGRES_PASSWORD=public-test-fixture-only", "--mount", f"type=bind,source={SNAPSHOTS},target=/snapshots,readonly", "--mount", f"type=bind,source={HERE},target=/evidence,readonly", "postgres:16-bookworm")
try:
    for attempt in range(60):
        if docker("exec", NAME, "pg_isready", "-h", "127.0.0.1", "-U", "postgres", check=False).returncode == 0:
            break
        time.sleep(1)
    else:
        raise RuntimeError("Postgres test container did not become ready")
    print(sql("-c", "SELECT version();"))
    print(sql("-f", "/evidence/sql-fixtures.sql"))
    output = sql("--csv", "-f", "/snapshots/keycloak-postgres.sql")
    print("Exact Keycloak SQL output:\n" + output)
    assert "fixture@example.com" in output and "fixture-hash" in output and "outside@example.com" not in output
    print(sql("-f", "/snapshots/supabase-export.sql"))
    users = json.loads(sql("-tA", "-c", "SELECT ufn_get_user_migration_data_json();"))
    assert len(users) == 2
    local = next(user for user in users if user["provider"] == "email")
    social = next(user for user in users if user["provider"] == "google")
    assert local["factor"] == "12" and local["salt"] == "1234567890123456789012"
    assert local["password"] == "abcdefghijklmnopqrstuvwxyza" and local["encryptionScheme"] == "bcrypt"
    assert social["password"] == "hasprovider" and "encryptionScheme" not in social
    print("PASS: Exact Keycloak PostgreSQL realm filtering/credential export and Supabase local/social user JSON on isolated fixture schemas. Not a real provider migration.")
finally:
    docker("stop", NAME)
