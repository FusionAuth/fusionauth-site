export SVC_NAME=$(kubectl get svc --namespace default -l "app.kubernetes.io/name=fusionauth,app.kubernetes.io/instance=my-release" -o jsonpath="{.items[0].metadata.name}")
kubectl port-forward svc/$SVC_NAME 9011:9011
