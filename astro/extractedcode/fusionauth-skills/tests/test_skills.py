"""Cheap checks for every skills/<name>/SKILL.md (frontmatter, line length, no pinned FusionAuth version) and the plugin manifests."""

import json
import re
import sys
from pathlib import Path

# limits from the Agent Skills spec
NAME = re.compile(r"^[a-z0-9]+(-[a-z0-9]+)*$")
MAX_NAME, MAX_DESCRIPTION = 64, 1024
# the docs page shows each skill in a code block that doesn't wrap
MAX_LINE = 80
# a three-part version would go stale; the compose file carries the pin
VERSION = re.compile(r"\b\d+\.\d+\.\d+\b")
FENCE = re.compile(r"^ *(```|~~~)")


def frontmatter(text):
    match = re.match(r"^---\n(.*?)\n---\n", text, re.S)
    if not match:
        return None
    fields, key = {}, None
    for line in match[1].splitlines():
        # indented lines continue the previous value, as in YAML
        if line.startswith(" ") and key:
            fields[key] = f"{fields[key]} {line.strip()}".strip()
            continue
        key, sep, value = line.partition(":")
        key = key.strip() if sep else None
        if key:
            fields[key] = value.strip()
    return fields


def check(skill):
    errors = []
    directory = skill.parent.name
    text = skill.read_text()

    fields = frontmatter(text)
    if fields is None:
        return ["missing frontmatter between --- lines at the top of the file"]
    name, description = fields.get("name", ""), fields.get("description", "")
    if name != directory:
        errors.append(f'frontmatter name "{name}" must match its directory "{directory}"')
    if not NAME.match(name) or len(name) > MAX_NAME:
        errors.append(f'frontmatter name "{name}" must be lowercase words joined by hyphens, at most {MAX_NAME} characters')
    if not description:
        errors.append("frontmatter description is missing")
    elif len(description) > MAX_DESCRIPTION:
        errors.append(f"frontmatter description is {len(description)} characters, more than {MAX_DESCRIPTION}")

    in_code = False
    for number, line in enumerate(text.splitlines(), 1):
        if FENCE.match(line):
            in_code = not in_code
        elif not in_code and len(line) > MAX_LINE:
            errors.append(f"line {number} is {len(line)} characters; wrap it at {MAX_LINE} so it reads on the docs page")
        for version in VERSION.findall(line):
            errors.append(f"line {number} names version {version}; link to docs that track the pinned release instead")
    return errors


def server_urls(servers):
    return {name: server.get("url") for name, server in servers.items()}


def check_manifests():
    errors = []
    try:
        claude = json.loads(Path(".claude-plugin/plugin.json").read_text())
        openai = json.loads(Path("plugin.json").read_text())
        claude_mcp = json.loads(Path(".mcp.json").read_text())["mcpServers"]
        openai_mcp = json.loads(Path("mcp.json").read_text())["mcpServers"]
    except (OSError, ValueError, KeyError) as error:
        return [f"can't read a manifest: {error}"]
    for key in ("name", "description", "license", "repository"):
        if claude.get(key) != openai.get(key):
            errors.append(f'"{key}" differs between .claude-plugin/plugin.json and plugin.json')
    # no version means the Claude directory and GitHub installs track commits, so nobody has to bump it
    if "version" in claude:
        errors.append('remove "version" from .claude-plugin/plugin.json; the directory tracks commits')
    if "version" not in openai:
        errors.append('plugin.json needs a "version"; raise it for each OpenAI ZIP')
    if server_urls(claude_mcp) != server_urls(openai_mcp):
        errors.append("MCP servers differ between .mcp.json and mcp.json")
    return errors + check_openai_limits(openai.get("extensions", {}).get("com.openai", {}))


def check_openai_limits(extension):
    # limits the OpenAI portal enforces, which otherwise only show up after an upload
    errors = []
    interface, review = extension.get("interface", {}), extension.get("review", {})
    for key in ("displayName", "shortDescription"):
        if len(interface.get(key, "")) > 30:
            errors.append(f'interface "{key}" in plugin.json is longer than 30 characters')
    prompts = interface.get("defaultPrompt", [])
    if len(prompts) > 3 or any(len(prompt) > 128 for prompt in prompts):
        errors.append('interface "defaultPrompt" in plugin.json needs at most 3 prompts of at most 128 characters')
    cases = review.get("test_cases", {})
    if len(cases.get("positive", [])) != 5 or len(cases.get("negative", [])) != 3:
        errors.append('review "test_cases" in plugin.json needs exactly 5 positive and 3 negative cases')
    return errors


def main():
    skills = sorted(Path("skills").glob("*/SKILL.md"))
    if not skills:
        print("No skills/<name>/SKILL.md files found.", file=sys.stderr)
        return 1
    failed = False
    for skill in skills:
        errors = check(skill)
        if errors:
            failed = True
            print(f"FAIL {skill}")
            for error in errors:
                print(f"  {error}")
        else:
            print(f"ok   {skill}")
    errors = check_manifests()
    if errors:
        failed = True
        print("FAIL plugin manifests")
        for error in errors:
            print(f"  {error}")
    else:
        print("ok   plugin manifests")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
