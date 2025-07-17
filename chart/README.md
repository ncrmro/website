# Github deploy from github action

```shell
helm --kubeconfig ~/.kube/config.mercury upgrade --install ncrmro-website ./chart --values chart/values.production.yaml
```