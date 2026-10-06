"""Test displayed snapshots; fixtures do not prove a complete provider migration."""
import ast
import csv
import hashlib
import io
import json
from pathlib import Path
import re
import subprocess
import unittest

ROOT = Path(__file__).resolve().parents[1]


def run(*args, cwd=ROOT):
    return subprocess.run(args, cwd=cwd, text=True, capture_output=True, check=True).stdout


def function(filename, name, extra=None):
    tree = ast.parse((ROOT / filename).read_text())
    node = next(n for n in tree.body if isinstance(n, ast.FunctionDef) and n.name == name)
    namespace = {"json": json, **(extra or {})}
    exec(compile(ast.Module(body=[node], type_ignores=[]), filename, "exec"), namespace)
    return namespace[name]


class DisplayedPassages(unittest.TestCase):
    def test_pinned_snapshot_checksums(self):
        entries = re.findall(r"\| `([^`]+)` \| .* \| `([a-f0-9]{64})` \|", (ROOT / "SOURCES.md").read_text())
        self.assertEqual(len(entries), 8)
        for filename, expected in entries:
            with self.subTest(filename=filename):
                self.assertEqual(hashlib.sha256((ROOT / filename).read_bytes()).hexdigest(), expected)

    def test_stytch_csv_preparation_and_user_join(self):
        raw = list(csv.reader(io.StringIO((ROOT / "stytch-password-hashes.csv").read_text())))
        prepared = list(csv.reader(io.StringIO((ROOT / "stytch-prepared-hashes.csv").read_text())))
        self.assertEqual(raw[6], ["id", "hash", "salt", "hash_method", "project_id"])
        self.assertEqual(raw[7:], prepared)
        user = json.loads((ROOT / "stytch-user.json").read_text())[0]
        self.assertEqual([user["user_id"], user["hash"], user["salt"], user["hashAlgorithm"]], prepared[0][:4])

    def test_real_node_scrypt_reproduces_documented_base64_difference(self):
        output = run("node", "stytch-check-hash.mjs")
        self.assertIn("Matches provided hash: false", output)
        actual = re.search(r"Hash: (\S+)", output)[1]
        expected = list(csv.reader(io.StringIO((ROOT / "stytch-prepared-hashes.csv").read_text())))[2][1]
        self.assertEqual(actual.replace("+", "-").replace("/", "_"), expected)
        self.assertNotEqual(actual, expected)

    def test_javascript_passages_parse(self):
        for filename in ROOT.glob("*.mjs"):
            with self.subTest(filename=filename.name):
                run("node", "--check", str(filename))

    def test_forgerock_help_exits_without_network(self):
        output = run("ruby", "forgerock-export.rb", "-h")
        self.assertIn("Usage: forgerock-export.rb [options]", output)
        self.assertIn("--output-file OUTPUT_FILE", output)
        self.assertIn("--user-password", output)

    def test_ping_bulk_transform_real_function(self):
        transform = function("exportPingUsers.py", "transform_json")
        fixture = {"enabled": True, "email": "fixture@example.com", "id": "fixture-id", "name": {"family": "Family"}, "username": "fixture"}
        result = transform({"_embedded": {"users": [fixture]}})
        user = result["users"][0]
        self.assertEqual(user["email"], fixture["email"])
        self.assertEqual(user["id"], fixture["id"])
        self.assertEqual(user["lastName"], "Family")
        self.assertIsNone(user["password"])
        self.assertEqual(transform({"_embedded": {"users": []}}), {"users": []})

    def test_ping_connector_transform_real_function(self):
        fixture = {"enabled": True, "email": "fixture@example.com", "id": "fixture-id", "name": {"given": "Fixture", "family": "Family"}, "username": "fixture", "verifyStatus": False}
        calls = []
        def read_user(user_id):
            calls.append(user_id)
            return fixture
        transform = function("pingIdentityAuth.py", "transform_json_user", {"readUserInfo": read_user})
        user = transform(json.dumps({"_embedded": {"user": {"id": "fixture-id"}}}))["user"]
        self.assertEqual(calls, ["fixture-id"])
        self.assertEqual(user["firstName"], "Fixture")
        self.assertEqual(user["lastName"], "Family")
        self.assertTrue(user["data"]["migrated"])
        self.assertFalse(user["verified"])


if __name__ == "__main__":
    print(run("node", "--version").strip())
    print(run("ruby", "--version").strip())
    unittest.main(verbosity=2)
