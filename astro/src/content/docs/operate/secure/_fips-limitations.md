Running FusionAuth in FIPS compliant mode has limitations:

* This mode may only be enabled on new installations of FusionAuth. An existing FusionAuth installation cannot be converted to run in this mode.
* All nodes in a cluster must be running in this mode.
* Customers must use a FIPS compliant database and search engine version. FusionAuth does not provide the database or the search engine, so this is the responsibility of the customer to use a FIPS compliant PostgreSQL, MySQL, and OpenSearch version.
* This mode is only available for self-hosted instances.
