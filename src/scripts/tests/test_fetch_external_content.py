"""Exercise the real refresh script offline, using temporary Git/curl/java fixtures."""
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[3]
SNAPSHOTS = Path("astro/extractedcode/configuration-snippets")
JSON_GEN = Path("astro/src/content/json/generated")
THEME_TEMPLATES = Path("astro/src/content/json/themes/templates.json")

# An independent list verifies the whitelist and the two ignored-path mappings.
SOURCES = {
    "containers": ("fusionauth-containers", {
        "docker/fusionauth/docker-compose.yml": "docker/fusionauth/docker-compose.yml",
        "docker/fusionauth/sample.env": "docker/fusionauth/.env",
        "docker/fusionauth/fusionauth-app/Dockerfile": "docker/fusionauth/fusionauth-app/Dockerfile",
        "docker/fusionauth/fusionauth-app-mysql/Dockerfile": "docker/fusionauth/fusionauth-app-mysql/Dockerfile",
    }),
    "contrib": ("fusionauth-contrib", {
        "kubernetes/istio/fusionauth-all-in-one.yaml": "kubernetes/istio/fusionauth-all-in-one.yaml",
    }),
    "example-docker-compose": ("fusionauth-example-docker-compose", {
        "plugin-build/docker-compose.yml": "build/docker-compose.yml",
        "plugin-build/fusionauth-app/Dockerfile": "build/fusionauth-app/Dockerfile",
        "kafka/docker-compose.yml": "kafka/docker-compose.yml",
        "kickstart/docker-compose.yml": "kickstart/docker-compose.yml",
        "mailcatcher/docker-compose.yml": "mailcatcher/docker-compose.yml",
        "plugin/docker-compose.yml": "plugin/docker-compose.yml",
    }),
}

FAKE_COMMAND = r'''#!/usr/bin/env python3
import json, os, pathlib, sys
data = json.loads(pathlib.Path(os.environ["FETCH_FIXTURE"]).read_text())
args = sys.argv[1:]
command = pathlib.Path(sys.argv[0]).name
with open(os.environ["FETCH_REQUESTS"], "a") as log:
    log.write(json.dumps([command, args]) + "\n")

if command == "git":
    assert "ls-remote" in args and args[-1] == "refs/heads/main", args
    assert args[0] == "-C" and pathlib.Path(args[1]).is_dir(), args
    assert pathlib.Path(args[1]).resolve() != pathlib.Path.cwd(), "Resolve outside the caller checkout"
    repo = args[-2].split("/")[-1].removesuffix(".git")
    if data.get("git_error") == repo:
        sys.exit(128)
    print(data["heads"][repo] + "\trefs/heads/main")
elif command == "jq":
    print("1.99.0")
elif command == "javac":
    pass
elif command == "javap":
    assert args[-1] == "io.fusionauth.domain.Theme$Templates", args
    print("public class io.fusionauth.domain.Theme$Templates {")
    for field in data["theme_fields"]:
        print(f"  public java.lang.String {field};")
    print("  public io.fusionauth.domain.Theme$Templates();")
    print("}")
elif command == "java":
    if "GenerateJSONFromAnnotations" in args:
        out_dir = pathlib.Path(args[args.index("GenerateJSONFromAnnotations") + 1])
        for f in ["indexentity.json", "indexuser.json", "cookies.json", "authenticationtype.json"]:
            (out_dir / f).write_text(data["json"][f])
    elif "GenerateEndpointsJSON" in args:
        pathlib.Path(args[args.index("GenerateEndpointsJSON") + 1]).write_text(data["json"]["api-endpoints.json"])
elif command == "unzip":
    if "-p" in args:
        sys.stdout.write(data["json"]["sample-usage-data.json"])
    else:
        out = pathlib.Path(args[args.index("-d") + 1])
        (out / "fusionauth-app/lib").mkdir(parents=True)
        (out / "fusionauth-app/lib/dummy.jar").touch()
elif command == "curl":
    if any("account.fusionauth.io" in a for a in args):
        print('{"versions": ["1.99.0"]}')
    elif any("files.fusionauth.io" in a for a in args):
        pathlib.Path(args[args.index("-o") + 1]).write_text("mock zip")
    else:
        assert args[-1].startswith("https://raw.githubusercontent.com/FusionAuth/")
        repo, revision, path = args[-1].split("/", 4)[4].split("/", 2)
        assert revision == data["heads"][repo], "Fetch was not pinned to the documented branch"
        key = repo + "/" + path
        if data.get("curl_error") == key:
            pathlib.Path(args[args.index("--output") + 1]).write_text("partial response")
            print("curl: (22) simulated HTTP 404", file=sys.stderr)
            sys.exit(22)
        pathlib.Path(args[args.index("--output") + 1]).write_text(data["files"][key])
'''


class RefreshTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="external-content-test-")
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        
        # Setup snapshots
        self.snapshots = self.root / SNAPSHOTS
        shutil.copytree(ROOT / SNAPSHOTS, self.snapshots)
        
        # Setup JSON directory
        self.json_dir = self.root / JSON_GEN
        self.json_dir.parent.mkdir(parents=True, exist_ok=True)
        if (ROOT / JSON_GEN).exists():
            shutil.copytree(ROOT / JSON_GEN, self.json_dir)
        else:
            self.json_dir.mkdir()

        self.theme_templates = self.root / THEME_TEMPLATES
        self.theme_templates.parent.mkdir(parents=True)
        shutil.copy2(ROOT / THEME_TEMPLATES, self.theme_templates)

        self.script = self.root / "src/scripts/fetch_external_content.sh"
        self.script.parent.mkdir(parents=True)
        shutil.copy2(ROOT / "src/scripts/fetch_external_content.sh", self.script)
        
        self.fixture = {"heads": {}, "files": {}, "json": {}}
        attribution = (self.snapshots / "SOURCES.md").read_text()
        
        # Load snapshot fixtures
        for directory, (repo, files) in SOURCES.items():
            revision = re.search(rf"\| `{directory}/` \|.*\| `([a-f0-9]{{40}})`", attribution)[1]
            self.fixture["heads"][repo] = revision
            for local, remote in files.items():
                content = (self.snapshots / directory / local).read_text()
                self.assertTrue(content, f"Missing or empty real snapshot: {local}")
                self.fixture["files"][f"{repo}/{remote}"] = content
                
        # Load JSON fixtures
        for json_file in ["sample-usage-data.json", "indexentity.json", "indexuser.json", 
                          "cookies.json", "authenticationtype.json", "api-endpoints.json"]:
            path = self.json_dir / json_file
            if not path.exists():
                path.write_text('{\n  "mock": "data"\n}')
            self.fixture["json"][json_file] = path.read_text()
        self.fixture["theme_fields"] = [t["fieldName"] for t in json.loads(self.theme_templates.read_text())]

        # Wire up mock tools
        fake_bin = self.root / "bin"
        fake_bin.mkdir()
        for command in ("git", "curl", "jq", "unzip", "javac", "java", "javap"):
            executable = fake_bin / command
            executable.write_text(FAKE_COMMAND)
            executable.chmod(0o755)
            
        self.fixture_path = self.root / "fixture.json"
        self.requests = self.root / "requests.jsonl"
        self.environment = dict(os.environ, PATH=f"{fake_bin}:{os.environ['PATH']}",
                                FETCH_FIXTURE=str(self.fixture_path), FETCH_REQUESTS=str(self.requests),
                                GITHUB_STEP_SUMMARY=str(self.root / "summary.md"))
        for name in ("FUSIONAUTH_VERSION", "FUSIONAUTH_APP_ZIP"):
            self.environment.pop(name, None)
        self.before = self.contents()

    def _tracked_files(self):
        files = list(self.snapshots.rglob("*")) + list(self.json_dir.rglob("*")) + [self.theme_templates]
        return [p for p in files if p.is_file()]

    def contents(self):
        return {str(path.relative_to(self.root)): path.read_bytes() for path in self._tracked_files()}

    def file_metadata(self):
        return {str(path.relative_to(self.root)): (path.stat().st_mtime_ns, path.stat().st_ino, path.stat().st_mode)
                for path in self._tracked_files()}

    def run_script(self, *arguments):
        self.fixture_path.write_text(json.dumps(self.fixture))
        return subprocess.run(["bash", str(self.script), *arguments], cwd=self.root / "bin",
                              env=self.environment, capture_output=True, text=True, timeout=30)

    def change_container(self):
        self.fixture["heads"]["fusionauth-containers"] = "a" * 40
        self.fixture["files"]["fusionauth-containers/docker/fusionauth/docker-compose.yml"] += "# upstream change\n"

    def test_current_snapshots_match_and_all_mappings_are_fetched(self):
        result = self.run_script("--check")
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("All configuration snapshots and generated JSON files match upstream", result.stdout)
        self.assertEqual(self.contents(), self.before)
        requests = [json.loads(line) for line in self.requests.read_text().splitlines()]
        
        self.assertEqual(sum(command == "git" for command, _ in requests), 3)
        self.assertEqual(sum(command == "curl" for command, _ in requests), 13) # 11 github + 1 API + 1 zip
        self.assertEqual(sum(command == "unzip" for command, _ in requests), 2)
        self.assertEqual(sum(command == "javac" for command, _ in requests), 2)
        self.assertEqual(sum(command == "java" for command, _ in requests), 2)

    def test_unrelated_upstream_commits_do_not_create_false_drift(self):
        self.fixture["heads"] = dict.fromkeys(self.fixture["heads"], "b" * 40)
        for arguments in (("--check",), ()):
            self.assertEqual(self.run_script(*arguments).returncode, 0)
            self.assertEqual(self.contents(), self.before)

    def test_stale_check_fails_with_diff_without_writing(self):
        self.change_container()
        metadata = self.file_metadata()
        result = self.run_script("--check")
        self.assertEqual(result.returncode, 1)
        self.assertIn("+# upstream change", result.stdout)
        self.assertIn("No local files were modified", result.stderr)
        self.assertEqual(self.contents(), self.before)
        self.assertEqual(self.file_metadata(), metadata)
        summary = (self.root / "summary.md").read_text()
        self.assertIn("bash src/scripts/fetch_external_content.sh", summary)
        self.assertIn("+# upstream change", summary)

    def test_json_drift_is_detected_and_fails_check(self):
        self.fixture["json"]["api-endpoints.json"] = '{\n  "changed": true\n}'
        result = self.run_script("--check")
        self.assertEqual(result.returncode, 1)
        self.assertIn("Changed JSON: api-endpoints.json", result.stdout)
        self.assertIn('+  "changed": true', result.stdout)
        self.assertEqual(self.contents(), self.before)

    def test_json_whitespace_drift_is_ignored_by_check(self):
        original = self.fixture["json"]["api-endpoints.json"]
        self.fixture["json"]["api-endpoints.json"] = original.replace("{", "{\n    ")
        result = self.run_script("--check")
        self.assertEqual(result.returncode, 0)
        self.assertEqual(self.contents(), self.before)

    def test_refresh_skips_whitespace_only_json_changes(self):
        self.fixture["json"]["api-endpoints.json"] = self.fixture["json"]["api-endpoints.json"].replace("{", "{\n    ")
        self.change_container()
        self.assertEqual(self.run_script().returncode, 0)
        path = str(JSON_GEN / "api-endpoints.json")
        self.assertEqual(self.contents()[path], self.before[path])

    def test_curl_does_not_load_user_configuration(self):
        self.assertEqual(self.run_script("--check").returncode, 0)
        requests = [json.loads(line) for line in self.requests.read_text().splitlines()]
        for command, args in requests:
            if command == "curl" and "raw.githubusercontent" in args[-1]:
                self.assertIn(args[0], ("-q", "--disable"))

    def test_refresh_updates_content_and_only_changed_repository_provenance(self):
        self.change_container()
        self.assertEqual(self.run_script().returncode, 0)
        after = self.contents()
        changed = {key for key in after if after[key] != self.before[key]}
        self.assertEqual(changed, {f"{SNAPSHOTS}/SOURCES.md", f"{SNAPSHOTS}/containers/docker/fusionauth/docker-compose.yml"})
        self.assertIn("a" * 40, after[f"{SNAPSHOTS}/SOURCES.md"].decode())
        self.assertEqual(self.run_script("--check").returncode, 0)

    def test_all_repositories_can_refresh_in_one_run(self):
        for index, (directory, (repo, files)) in enumerate(SOURCES.items(), 1):
            self.fixture["heads"][repo] = str(index) * 40
            remote = next(iter(files.values()))
            self.fixture["files"][f"{repo}/{remote}"] += "# changed\n"
        self.assertEqual(self.run_script().returncode, 0)
        attribution = (self.snapshots / "SOURCES.md").read_text()
        for index in range(1, 4):
            self.assertIn(str(index) * 40, attribution)
        self.assertEqual(self.run_script("--check").returncode, 0)

    def test_provenance_update_is_scoped_to_its_repository_row(self):
        attribution = self.snapshots / "SOURCES.md"
        old_revision = self.fixture["heads"]["fusionauth-containers"]
        note = f"\nHistorical reference: {old_revision}\n"
        attribution.write_text(attribution.read_text() + note)
        self.change_container()
        self.assertEqual(self.run_script().returncode, 0)
        after = attribution.read_text()
        self.assertIn(note, after)
        row = next(line for line in after.splitlines() if line.startswith("| `containers/`"))
        self.assertEqual(row.count("a" * 40), 2)

    def test_late_download_failure_leaves_all_snapshots_untouched(self):
        self.change_container()
        self.fixture["curl_error"] = "fusionauth-example-docker-compose/plugin/docker-compose.yml"
        metadata = self.file_metadata()
        for arguments in (("--check",), ()):
            with self.subTest(arguments=arguments):
                result = self.run_script(*arguments)
                self.assertNotEqual(result.returncode, 0)
                self.assertIn("HTTP 404", result.stderr)
                self.assertIn("No snapshots were modified", result.stderr)
                self.assertEqual(self.contents(), self.before)
                self.assertEqual(self.file_metadata(), metadata)

    def test_empty_response_does_not_overwrite_content(self):
        self.fixture["files"]["fusionauth-contrib/kubernetes/istio/fusionauth-all-in-one.yaml"] = ""
        result = self.run_script()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("Empty upstream file", result.stderr)
        self.assertEqual(self.contents(), self.before)

    def test_theme_template_drift_fails_both_modes_without_editing_templates_json(self):
        self.fixture["theme_fields"] = [f for f in self.fixture["theme_fields"] if f != "oauth2Wait"] + ["newTemplate"]
        for arguments in (("--check",), ()):
            with self.subTest(arguments=arguments):
                result = self.run_script(*arguments)
                self.assertEqual(result.returncode, 1)
                self.assertIn("+ newTemplate", result.stdout)
                self.assertIn("- oauth2Wait", result.stdout)
                self.assertEqual(self.contents(), self.before)
        self.assertIn("templates.json` by hand", (self.root / "summary.md").read_text())

    def test_unreadable_theme_class_fails(self):
        self.fixture["theme_fields"] = []
        result = self.run_script("--check")
        self.assertEqual(result.returncode, 1)
        self.assertIn("Could not read fields", result.stderr)

    def test_shared_app_zip_skips_version_lookup_and_download(self):
        zip_path = self.root / "shared.zip"
        zip_path.write_text("mock zip")
        self.environment.update(FUSIONAUTH_APP_ZIP=str(zip_path))
        self.assertEqual(self.run_script("--check").returncode, 0)
        requests = [json.loads(line) for line in self.requests.read_text().splitlines()]
        curl_args = [" ".join(args) for command, args in requests if command == "curl"]
        self.assertFalse(any("account.fusionauth.io" in a or "files.fusionauth.io" in a for a in curl_args))

    def test_head_resolution_failure_leaves_snapshots_untouched(self):
        self.change_container()
        self.fixture["git_error"] = "fusionauth-contrib"
        result = self.run_script()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("Could not resolve fusionauth-contrib/main", result.stderr)
        self.assertEqual(self.contents(), self.before)

    def test_invalid_recorded_revision_prevents_partial_refresh(self):
        self.change_container()
        attribution = self.snapshots / "SOURCES.md"
        attribution.write_text(attribution.read_text().replace(
            self.fixture["heads"]["fusionauth-contrib"], "invalid"))
        before = self.contents()
        result = self.run_script()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("Missing or invalid source revision for contrib", result.stderr)
        self.assertEqual(self.contents(), before)

    def test_invalid_upstream_revision_is_rejected(self):
        self.fixture["heads"]["fusionauth-containers"] = "main"
        self.assertNotEqual(self.run_script().returncode, 0)
        self.assertEqual(self.contents(), self.before)

    def test_missing_snapshot_is_reported_and_can_be_restored(self):
        path = self.snapshots / "containers/docker/fusionauth/sample.env"
        path.unlink()
        missing = self.contents()
        self.assertEqual(self.run_script("--check").returncode, 1)
        self.assertEqual(self.contents(), missing)
        self.assertEqual(self.run_script().returncode, 0)
        self.assertEqual(self.contents(), self.before)

    def test_final_newline_normalization_does_not_create_drift(self):
        key = "fusionauth-containers/docker/fusionauth/.env"
        self.fixture["files"][key] = self.fixture["files"][key].rstrip("\n")
        self.assertEqual(self.run_script("--check").returncode, 0)
        self.assertEqual(self.contents(), self.before)

    def test_export_metadata_is_rejected_before_fetching(self):
        for path in self.snapshots.rglob("repositoryUrl.txt"):
            self.fail(f"External snapshots must not export: {path}")
        (self.snapshots / "containers/repositoryUrl.txt").write_text("https://github.com/example/example")
        result = self.run_script()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("must not be exported", result.stderr)
        self.assertFalse(self.requests.exists())

    def test_spaces_on_blank_lines_do_not_create_drift(self):
        key = "fusionauth-example-docker-compose/kafka/docker-compose.yml"
        self.fixture["files"][key] = self.fixture["files"][key].replace("\n\nnetworks:", "\n \t\nnetworks:")
        self.assertEqual(self.run_script("--check").returncode, 0)
        self.assertEqual(self.contents(), self.before)

    def test_nonblank_whitespace_and_extra_newlines_are_real_drift(self):
        key = "fusionauth-containers/docker/fusionauth/.env"
        original = self.fixture["files"][key]
        for content in (" " + original, original + "\n", original.replace("\n", " \n", 1)):
            with self.subTest(content=content):
                self.fixture["files"][key] = content
                result = self.run_script("--check")
                self.assertEqual(result.returncode, 1)
                self.assertIn("Changed snapshot: containers/docker/fusionauth/sample.env", result.stdout)
                self.assertEqual(self.contents(), self.before)

    def test_help_and_invalid_arguments_do_not_fetch(self):
        self.assertEqual(self.run_script("--help").returncode, 0)
        self.assertEqual(self.run_script("--invalid").returncode, 2)
        self.assertEqual(self.run_script("--check", "unexpected").returncode, 2)
        self.assertFalse(self.requests.exists())


if __name__ == "__main__":
    unittest.main(verbosity=2)