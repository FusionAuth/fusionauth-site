# Displayed migration-source snapshots

These are manually copied passages displayed by passportjs, rails migration guides, retrieved on 2026-10-04. The maintained repositories remain the source of truth; this collection is not published back to them. Only displayed source is included, not runnable migration projects.

Guides preserve the source languages and existing titles. CRLF is normalized to LF, trailing whitespace is removed, and a final newline is added. No other source changes are made.

| Local file | Pinned source (entire displayed file) | SHA-256 of local snapshot |
|---|---|---|
| `passport-export.mjs` | [FusionAuth/fusionauth-example-migrating-node: scripts/4_exportUsers.mjs](https://github.com/FusionAuth/fusionauth-example-migrating-node/blob/6937b27388da3d6fc6e4298c0dbd9d05083ae161/scripts/4_exportUsers.mjs) | `8549baf5bf0728ef563b2d10afc4eb46defeda7684bc50bfe92f004a767afa12` |
| `passport-convert.mjs` | [FusionAuth/fusionauth-example-migrating-node: scripts/5_convertUserToFaUser.mjs](https://github.com/FusionAuth/fusionauth-example-migrating-node/blob/6937b27388da3d6fc6e4298c0dbd9d05083ae161/scripts/5_convertUserToFaUser.mjs) | `46984cd38571da7ad482757da561ba3ff913dc1c470968a2955c96737011c40b` |
| `rails-devise-export.rb` | [FusionAuth/fusionauth-import-scripts: rails/export-scripts/devise/export_users_for_fusionauth.rb](https://github.com/FusionAuth/fusionauth-import-scripts/blob/e51a12a21af15bba3554588ce950597dddaf0cbd/rails/export-scripts/devise/export_users_for_fusionauth.rb) | `f124deff9b2625b3c33f417436dc0a6487d652642dc4be3c09edb22e50c446f0` |
| `rails-devise-users.json` | [FusionAuth/fusionauth-import-scripts: rails/export-scripts/devise/users_export.json](https://github.com/FusionAuth/fusionauth-import-scripts/blob/e51a12a21af15bba3554588ce950597dddaf0cbd/rails/export-scripts/devise/users_export.json) | `3ac0b7f0c0436e096c3806088506bd09147c36aa17140b5e4d330e671095fdce` |
| `rails-omniauth-export.rb` | [FusionAuth/fusionauth-import-scripts: rails/export-scripts/omniauth/export_users_for_fusionauth.rb](https://github.com/FusionAuth/fusionauth-import-scripts/blob/e51a12a21af15bba3554588ce950597dddaf0cbd/rails/export-scripts/omniauth/export_users_for_fusionauth.rb) | `a56b7c1eedc342bfc122eccadc76e5b40347b7c0cd1df7992c8f8683d86e6cb7` |
| `rails-omniauth-users.json` | [FusionAuth/fusionauth-import-scripts: rails/export-scripts/omniauth/users_export.json](https://github.com/FusionAuth/fusionauth-import-scripts/blob/e51a12a21af15bba3554588ce950597dddaf0cbd/rails/export-scripts/omniauth/users_export.json) | `e559b47935645e2751edc3d5c819ec0baaabcbe1f083aee6593fbe81db42d1e1` |
| `rails-built-in-auth-export.rb` | [FusionAuth/fusionauth-import-scripts: rails/export-scripts/built-in-auth/export_users_for_fusionauth.rb](https://github.com/FusionAuth/fusionauth-import-scripts/blob/e51a12a21af15bba3554588ce950597dddaf0cbd/rails/export-scripts/built-in-auth/export_users_for_fusionauth.rb) | `111039ccd502753067b2e13a9bea7d05994d2a416e51faa1abc3ab1bff5ac957` |
| `rails-built-in-auth-users.json` | [FusionAuth/fusionauth-import-scripts: rails/export-scripts/built-in-auth/users_export.json](https://github.com/FusionAuth/fusionauth-import-scripts/blob/e51a12a21af15bba3554588ce950597dddaf0cbd/rails/export-scripts/built-in-auth/users_export.json) | `e28dbfe16f9cea4184153d7e06eac308ff0243969f5f15c0400369eea33c5d62` |

## Verification

Run `bash tests/test.sh` with Python 3, Node.js and Ruby. This verifies all eight pinned files, parses the JavaScript and exercises the actual Passport mapper and Rails exporters with isolated model fixtures. Fixtures do not prove a full Rails/Passport database export, user import or login.
