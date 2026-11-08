kubectl wait --timeout=5m -n envoy-gateway-system deployment/envoy-gateway --for=condition=Available
