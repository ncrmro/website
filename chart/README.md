# Github deploy from github action

openssl genrsa -out dave.key 4096

```bash
NAMESPACE=nextjs-sqlite
CLUSTER_NAME=mercury
USER=${NAMESPACE}-github-actions
openssl genrsa -out /tmp/${USER}.key 2048
openssl req -new -key /tmp/${USER}.key -out /tmp/${USER}.csr \
-subj "/CN=${USER}/O=edit}"
BASE64_CSR=$(cat /tmp/${USER}.csr | base64 | tr -d '\n')

#kubectl create namespace ${NAMESPACE}
#kubectl create rolebinding github-actions \
#    --clusterrole edit \
#    --user ${USER} \
#    --namespace ${NAMESPACE}

```

```yaml
apiVersion: v1
kind: Config
clusters:
- cluster:
    certificate-authority-data: $(cat /var/lib/rancher/k3s/server/tls/server-ca.crt)
    server: ${CLUSTER_ENDPOINT}
  name: ${CLUSTER_NAME}
users:
- name: ${USER}
  user:
    client-certificate-data: ${CLIENT_CERTIFICATE_DATA}
contexts:
- context:
    cluster: ${CLUSTER_NAME}
    user: dave
  name: ${USER}-${CLUSTER_NAME}
current-context: ${USER}-${CLUSTER_NAME}
```

```bash

```

```yaml
apiVersion: v1
kind: Config
clusters:
- cluster:
    certificate-authority-data: LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUJkekNDQVIyZ0F3SUJBZ0lCQURBS0JnZ3Foa2pPUFFRREFqQWpNU0V3SHdZRFZRUUREQmhyTTNNdGMyVnkKZG1WeUxXTmhRREUyT0RJNE1UZ3dNekF3SGhjTk1qTXdORE13TURFeU56RXdXaGNOTXpNd05ESTNNREV5TnpFdwpXakFqTVNFd0h3WURWUVFEREJock0zTXRjMlZ5ZG1WeUxXTmhRREUyT0RJNE1UZ3dNekF3V1RBVEJnY3Foa2pPClBRSUJCZ2dxaGtqT1BRTUJCd05DQUFRM016WXFWSGc2aXpDSjJBRnYvakNwZEoxbWp6TnRrQTg0UjkxdldIbHMKOVAwbXRVdWJEQVNzQVhrb3NzaUR0aU9IQ29IWU1kNDVDL2ZKK09rMmJVUzhvMEl3UURBT0JnTlZIUThCQWY4RQpCQU1DQXFRd0R3WURWUjBUQVFIL0JBVXdBd0VCL3pBZEJnTlZIUTRFRmdRVTYybXQ4QjIzR3BuaUlwTEQxQ2N3Cm9rSnVMeXd3Q2dZSUtvWkl6ajBFQXdJRFNBQXdSUUloQUpXQ0VlYloyNkJCWjVxVFJzZ1Fna3FVQ0tOb2xXM1AKT0o5MmNjcy9hZmdjQWlBSkgxazVWM0NXRnJMR2tqblZLS0hzOElJU2wxUm1GWlgvbUIxYVZlK2Y1QT09Ci0tLS0tRU5EIENFUlRJRklDQVRFLS0tLS0K
    server: https://108.61.224.219:6443
  name: mercury
users:
- name: nextjs-sqlite-github-actions
  user:
    client-certificate-data: ${CLIENT_CERTIFICATE_DATA}
contexts:
- context:
    cluster: mercury
    user: nextjs-sqlite-github-actions
  name: nextjs-sqlite-github-actions-mercury
current-context: nextjs-sqlite-github-actions-mercury
```