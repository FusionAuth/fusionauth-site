# Displayed migration-source snapshots

These are manually copied passages displayed by forgerock, pingone, stytch migration guides, retrieved on 2026-10-04. The maintained repositories remain the source of truth; this collection is not published back to them. Only displayed source is included, not runnable migration projects.

Guides preserve the source languages and existing titles. CRLF is normalized to LF, trailing whitespace is removed, and a final newline is added. The two AsciiDoc scryptParameters tag comments in the Java source are omitted from display; its license and behavior are retained. No other source changes are made.

| Local file | Pinned source (entire displayed file) | SHA-256 of local snapshot |
|---|---|---|
| `forgerock-export.rb` | [FusionAuth/fusionauth-import-scripts: forgerock/forgerock-export.rb](https://github.com/FusionAuth/fusionauth-import-scripts/blob/e51a12a21af15bba3554588ce950597dddaf0cbd/forgerock/forgerock-export.rb) | `4f1fe36a064a89f932c49737c4123c8b130a58f5dd960979e43f38fd848532f9` |
| `pingIdentityAuth.py` | [FusionAuth/fusionauth-import-scripts: pingidentity/export/slowmigration/pingIdentityAuth.py](https://github.com/FusionAuth/fusionauth-import-scripts/blob/e51a12a21af15bba3554588ce950597dddaf0cbd/pingidentity/export/slowmigration/pingIdentityAuth.py) | `81bfbc0cfd06c57db27d0fa100e8b44fd9bc8257504ecb64ad6664fd4c2e468d` |
| `exportPingUsers.py` | [FusionAuth/fusionauth-import-scripts: pingidentity/export/bulk/exportPingUsers.py](https://github.com/FusionAuth/fusionauth-import-scripts/blob/e51a12a21af15bba3554588ce950597dddaf0cbd/pingidentity/export/bulk/exportPingUsers.py) | `8e52905f5622c24dc31ef66f54424b451d1452975a7ef03222d6072a74dc66d5` |
| `stytch-password-hashes.csv` | [FusionAuth/fusionauth-import-scripts: stytch/exampleData/3_responseDecryption/stytch_password_hashes.csv](https://github.com/FusionAuth/fusionauth-import-scripts/blob/e51a12a21af15bba3554588ce950597dddaf0cbd/stytch/exampleData/3_responseDecryption/stytch_password_hashes.csv) | `f52fdf6cf613b1cd39adb7a5cb92a19d3dc1f65f5390fe40929fb79d30fc6a0c` |
| `stytch-check-hash.mjs` | [FusionAuth/fusionauth-import-scripts: stytch/js/2_checkHash.mjs](https://github.com/FusionAuth/fusionauth-import-scripts/blob/e51a12a21af15bba3554588ce950597dddaf0cbd/stytch/js/2_checkHash.mjs) | `a4c61f9baf8d699dddbaa9fa66dee870448d04d729efe4e1edb0959eaf94ec8b` |
| `stytch-prepared-hashes.csv` | [FusionAuth/fusionauth-import-scripts: stytch/exampleData/4_hashFilePreparation/hash.csv](https://github.com/FusionAuth/fusionauth-import-scripts/blob/e51a12a21af15bba3554588ce950597dddaf0cbd/stytch/exampleData/4_hashFilePreparation/hash.csv) | `7dace3431e0059c3cfedf7c6f4099a6e2f781db21bcc912c715266a55c35f31c` |
| `stytch-user.json` | [FusionAuth/fusionauth-import-scripts: stytch/exampleData/5_userDetailAndHashPreparation/user.json](https://github.com/FusionAuth/fusionauth-import-scripts/blob/e51a12a21af15bba3554588ce950597dddaf0cbd/stytch/exampleData/5_userDetailAndHashPreparation/user.json) | `f3a44fca2f53fde89898043d7e0ed35bf97a12f42bbe73aa5341086ecd7920b0` |
| `ExampleStytchScryptPasswordEncryptor.java` | [FusionAuth/fusionauth-contrib: Password Hashing Plugins/src/main/java/com/mycompany/fusionauth/plugins/ExampleStytchScryptPasswordEncryptor.java](https://github.com/FusionAuth/fusionauth-contrib/blob/d389f622f4a3e87415e556c60ea5df81e2e689de/Password%20Hashing%20Plugins/src/main/java/com/mycompany/fusionauth/plugins/ExampleStytchScryptPasswordEncryptor.java) | `de5eb1be726cb25d64fdba44eb3f7c3dfb7e08fea4fb65e07acc29b248d6ddd6` |

## Verification

Run `bash tests/test.sh` with Python 3, Node.js and Ruby. This verifies all eight pinned files and exercises the Stytch scrypt/CSV examples, ForgeRock help command and actual Ping transformations using controlled fixtures. Cloud authentication, licensed Connectors, Java plugin deployment and complete user migrations require external projects and credentials and are not covered.
