kubectl create secret generic fusionauth-db-credentials --from-literal=password='<fusionauth-user-password>'
kubectl create secret generic fusionauth-db-root-credentials --from-literal=password='<superuser-password>'
