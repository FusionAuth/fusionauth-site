---
name: integrate-fusionauth
description: Add FusionAuth login to an application by following the official
  FusionAuth QuickStart for its framework. Use when the user asks to add login,
  sign-up, or OAuth or OIDC authentication to an app with FusionAuth, or asks
  which FusionAuth QuickStart fits their stack.
---

# Integrate FusionAuth into an Application

The FusionAuth QuickStarts are the source of truth for these steps. This skill
picks the right QuickStart and applies it to the user's code.

1. Work out the app's framework and type (web, single-page app, native app, or
   API) from files such as `package.json`, `requirements.txt`, `go.mod`, or
   `Gemfile`. If you can't tell, ask the user.

1. Read https://fusionauth.io/docs/llms-quickstarts.txt and pick the QuickStart
   for that framework. If none matches, use the overview page for the app type
   from the same list, and tell the user that no QuickStart covers their
   framework.

1. Fetch the QuickStart's `.md` URL and read all of it before you change code.

1. If FusionAuth already responds at http://localhost:9011/api/health, skip the
   QuickStart's install steps, because a second instance can't bind port 9011.
   Ask the user to create an Application in the Admin UI with the QuickStart's
   redirect and logout URLs, and to give you its client Id and client secret.
   Otherwise, follow the QuickStart's install steps.

1. Apply the QuickStart's code steps to the user's existing app instead of
   creating the example app. Keep the user's structure and naming, and pin the
   library versions the QuickStart names.

1. Keep the client secret out of source control. Put it in the environment or
   the app's existing secrets file, and check that `.gitignore` covers that
   file.

1. Run the app and ask the user to log in once to confirm the flow works.

For questions the QuickStart doesn't answer, use the FusionAuth Docs MCP server
when it is available, or the docs index at https://fusionauth.io/docs/llms.txt.
