"""Test displayed snapshots; fixtures do not prove a complete provider migration."""
import hashlib
import json
from pathlib import Path
import re
import shutil
import subprocess
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]


def run(*args, cwd=ROOT):
    return subprocess.run(args, cwd=cwd, text=True, capture_output=True, check=True).stdout


class DisplayedPassages(unittest.TestCase):
    def test_pinned_snapshot_checksums(self):
        entries = re.findall(r"\| `([^`]+)` \| .* \| `([a-f0-9]{64})` \|", (ROOT / "SOURCES.md").read_text())
        self.assertEqual(len(entries), 8)
        for filename, expected in entries:
            with self.subTest(filename=filename):
                self.assertEqual(hashlib.sha256((ROOT / filename).read_bytes()).hexdigest(), expected)

    def test_javascript_passages_parse(self):
        for filename in ROOT.glob("*.mjs"):
            with self.subTest(filename=filename.name):
                run("node", "--check", str(filename))

    def test_passport_conversion_real_function_and_rejects_bad_hash(self):
        # Execute the actual displayed pure mapper; file streaming and provider
        # authentication are outside this unit test.
        program = '''
const fs = require('node:fs');
const vm = require('node:vm');
const crypto = require('node:crypto');
const source = fs.readFileSync('passport-convert.mjs', 'utf8');
const mapper = source.slice(source.indexOf('function getFaUserFromUser(user)'));
const context = {uuid: crypto.randomUUID, uuidValidate: value => /^[a-f0-9-]{36}$/.test(String(value)),
  applicationId: 'fixture-application', console, process};
vm.runInNewContext(mapper, context);
const input = JSON.parse(process.argv[1]);
console.log(JSON.stringify(context.getFaUserFromUser(input)));
'''
        fixture = {"id": 7, "email": "fixture@example.com", "active": 1, "verified": 1, "name": "Fixture User", "provider": "local", "password": "$2a$12$1234567890123456789012abcdefghijklmnopqrstuvwxyza"}
        user = json.loads(run("node", "-e", program, json.dumps(fixture)))
        self.assertEqual(user["email"], fixture["email"])
        self.assertEqual(user["factor"], 12)
        self.assertEqual(user["salt"], "1234567890123456789012")
        self.assertEqual(user["password"], "abcdefghijklmnopqrstuvwxyza")
        self.assertEqual(user["firstName"], "Fixture")
        self.assertEqual(user["data"]["original_user_id"], 7)
        self.assertEqual(user["registrations"][0]["applicationId"], "fixture-application")
        fixture["password"] = "invalid-fixture-hash"
        result = subprocess.run(["node", "-e", program, json.dumps(fixture)], cwd=ROOT, text=True, capture_output=True)
        self.assertEqual(result.returncode, 1)
        self.assertIn("CRITICAL ERROR: Failed to parse bcrypt hash", result.stderr)

    def test_ruby_exporters_execute_with_isolated_user_fixture(self):
        # These fake Rails model objects exercise the actual displayed exporter.
        # They are not a Rails database, login, or full migration integration test.
        setup = '''require 'ostruct'
class User
  def self.count; 1; end
  def self.all
    [OpenStruct.new(email: 'fixture@example.com', id: 7, name: 'Fixture User',
      provider: 'google_oauth2', uid: 'provider-7', active: true, image_url: nil,
      encrypted_password: '$2a$12$1234567890123456789012abcdefghijklmnopqrstuvwxyza',
      password_digest: '$2a$12$1234567890123456789012abcdefghijklmnopqrstuvwxyza',
      :confirmed? => true)]
  end
end
'''
        for variant in ["devise", "omniauth", "built-in-auth"]:
            with self.subTest(variant=variant), tempfile.TemporaryDirectory() as directory:
                temp = Path(directory)
                (temp / "config").mkdir()
                (temp / "config/environment.rb").write_text(setup)
                (temp / "scripts").mkdir()
                target = temp / ("scripts/export.rb" if variant == "built-in-auth" else "export.rb")
                shutil.copyfile(ROOT / f"rails-{variant}-export.rb", target)
                run("ruby", str(target), cwd=temp)
                result = json.loads((temp / "users_export.json").read_text())
                users = result if isinstance(result, list) else result["users"]
                self.assertEqual(len(users), 1)
                self.assertEqual(users[0]["email"], "fixture@example.com")
                self.assertEqual(users[0]["registrations"][0]["roles"], ["user"])
                if variant == "omniauth":
                    self.assertEqual(users[0]["data"]["oauth_uid"], "provider-7")
                    self.assertGreater(len(users[0]["password"]), 12)
                else:
                    self.assertEqual(users[0]["factor"], 12)
                    self.assertEqual(users[0]["salt"], "1234567890123456789012")
                    self.assertEqual(users[0]["password"], "abcdefghijklmnopqrstuvwxyza")

    def test_json_examples_are_valid_user_payloads(self):
        for filename in ROOT.glob("rails-*-users.json"):
            with self.subTest(filename=filename.name):
                user = json.loads(filename.read_text())["users"][0]
                self.assertIn("@", user["email"])
                self.assertEqual(user["registrations"][0]["roles"], ["user"])
                self.assertTrue(user["active"])


if __name__ == "__main__":
    print(run("node", "--version").strip())
    print(run("ruby", "--version").strip())
    unittest.main(verbosity=2)
