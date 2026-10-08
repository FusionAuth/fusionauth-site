curl \
-X PATCH \
-H 'Content-Type: application/json' \
-H 'X-FusionAuth-TenantId: TENANT-ID-HERE' \
-H 'Authorization: API-KEY-HERE' \
http://localhost:9011/api/application/APPLICATION-ID-HERE \
-d @patch.json
