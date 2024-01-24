# Github deploy from github action

```shell
kubectl --context ocean delete secret --namespace ncrmro-com regcred
kubectl --context ocean create secret --namespace ncrmro-com docker-registry regcred \
--docker-server=harbor.ncrmro.com --docker-username=Namerobot$ncrmro-desktop+website-kube-image-pull-secret \
--docker-password=CHANGEME

```