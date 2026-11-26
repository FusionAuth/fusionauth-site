# X.509 v3 Certificate Generator

This sample script automatically generates an X.509 v3 Certificate using RSA and uploads it to the [Key Master](https://fusionauth.io/docs/security/tokens-and-keys/key-master) in your FusionAuth instance. Use this tool to integrate with services that require X.509 v3 certificates, such as Aiven. Key Master generates X.509 v2 certificates.

## Prerequisites

- [bash](https://www.gnu.org/software/bash/) to run the script
- [openssl](https://www.openssl.org/) to issue certificates
- [jq](https://stedolan.github.io/jq/) to handle JSON objects

## Usage

* Create an [API Key](https://fusionauth.io/docs/apis/authentication#api-key-authentication) in your FusionAuth instance that has permission to `POST` to `/api/key/import`.
* Run `generate-certificate`.

The script will ask for three values:

- `Your FusionAuth instance URL (with scheme)`: the complete address for your instance (e.g. `http://localhost:9011`).
- `API Key with /api/key/import endpoint`: actual value for the API Key you've created.
- `Name for the generated key`: a descriptive name for the key. 

After providing the necessary values, it will automatically issue a certificate and upload it to the Key Master in your instance under the name you provided.
