#!/usr/bin/env python3
"""Checks that a running FusionAuth matches what kickstart/kickstart.json asks for.

Usage: python3 tests/check-kickstart.py [kickstart.json] [FusionAuth URL]

For each application the kickstart creates, compares its OAuth settings with the kickstart's. Then
checks the kickstart's theme has a stylesheet, and that each user it defines can log in.
"""
import json
import pathlib
import re
import sys
import urllib.error
import urllib.request

kickstart_file = sys.argv[1] if len(sys.argv) > 1 else str(pathlib.Path(__file__).parent.parent / 'kickstart/kickstart.json')
base_url = sys.argv[2] if len(sys.argv) > 2 else 'http://localhost:9011'

kickstart = json.loads(pathlib.Path(kickstart_file).read_text())
variables = kickstart.get('variables', {})


# kickstart values reference variables as #{name}; UUID() and friends are generated, so they can't be predicted
def resolve(value):
    if isinstance(value, str):
        return re.sub(r'#\{(\w+)\}', lambda m: str(variables.get(m.group(1), m.group(0))), value)
    if isinstance(value, list):
        return [resolve(v) for v in value]
    if isinstance(value, dict):
        return {k: resolve(v) for k, v in value.items()}
    return value


api_key = resolve(kickstart['apiKeys'][0]['key'])
failures = []


def request(path, body=None):
    req = urllib.request.Request(base_url + path, data=json.dumps(body).encode() if body is not None else None,
                                 headers={'Authorization': api_key, 'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            text = resp.read().decode()
            return resp.status, json.loads(text) if text else {}
    except urllib.error.HTTPError as e:
        return e.code, {}


def check(description, ok, detail=''):
    print(f"  {'PASS' if ok else 'FAIL'}: {description}{'' if ok else ' (' + detail + ')'}")
    if not ok:
        failures.append(description)


OAUTH_FIELDS = ['authorizedRedirectURLs', 'authorizedOriginURLs', 'enabledGrants', 'logoutURL', 'proofKeyForCodeExchangePolicy', 'clientAuthenticationPolicy']

for r in kickstart['requests']:
    url = resolve(r['url'])
    application = r.get('body', {}).get('application')
    if r['method'] != 'POST' or not url.lstrip('/').startswith('api/application/') or not application:
        continue
    app_id = url.rstrip('/').split('/')[-1]
    status, body = request(f'/api/application/{app_id}')
    check(f"application {application.get('name', app_id)} exists", status == 200, f'HTTP {status}')
    if status != 200:
        continue
    actual = body['application'].get('oauthConfiguration', {})
    expected = resolve(application.get('oauthConfiguration', {}))
    for field in OAUTH_FIELDS:
        if field in expected:
            want, got = expected[field], actual.get(field)
            same = sorted(want) == sorted(got or []) if isinstance(want, list) else want == got
            check(f'{field} is {want}', same, f'got {got}')

theme_requests = [r for r in kickstart['requests'] if resolve(r['url']).lstrip('/').startswith('api/theme/')]
if theme_requests:
    status, body = request('/api/theme')
    named = [t for t in body.get('themes', []) if t.get('name') in {r['body'].get('theme', {}).get('name') for r in theme_requests}]
    check('kickstart theme exists', bool(named), 'not found')
    if named:
        check('kickstart theme has its stylesheet', bool(named[0].get('stylesheet', '').strip()), 'stylesheet is empty')

application_id = variables.get('applicationId')
for name in sorted(variables):
    if not name.endswith('Email') or name.replace('Email', 'Password') not in variables:
        continue
    login = {'loginId': variables[name], 'password': variables[name.replace('Email', 'Password')]}
    if application_id:
        login['applicationId'] = application_id
    status, _ = request('/api/login', login)
    check(f"{variables[name]} can log in", status in (200, 202), f'HTTP {status}')

if failures:
    print(f'{len(failures)} kickstart check(s) failed.')
    sys.exit(1)
print('Kickstart checks passed.')
