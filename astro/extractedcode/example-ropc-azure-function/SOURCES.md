# Source and ownership

This docs-owned Azure Function supports the [Azure AD B2C migration guide](https://fusionauth.io/docs/lifecycle/migrate-users/provider-specific/azureadb2c).

Imported from [FusionAuth/fusionauth-example-ropc-azure-function](https://github.com/FusionAuth/fusionauth-example-ropc-azure-function/tree/dce93b0e4feaa0d2c5f02aff76a2366daf1263d1), commit `dce93b0e4feaa0d2c5f02aff76a2366daf1263d1`.

All tracked runtime and support files are retained, including the editor setup, sample input, package lock, license and local settings template. Repository-owned `.github/CODEOWNERS` remains external and is preserved by the publisher.

Changes from the source:

- Add a snippet boundary around `RopcProxyFunction/index.js`; runtime logic is unchanged.
- Replace tenant, flow, application and secret values in `local.settings.json` with explicit `YOUR_` placeholders. Configure these locally before running. No source credentials are distributed.
- Add the generated-source warning and settings instructions to the README.
- Add this provenance file and local tests. `tests/` is excluded by the existing publisher.
- Normalize line endings to LF and remove trailing whitespace.

Local fixture tests execute the actual Function and its Graph adapter using fake upstream responses. They do not prove an Azure AD B2C login or FusionAuth Connector migration. That journey requires an existing Azure tenant, its credentials and a paid FusionAuth Connector.
