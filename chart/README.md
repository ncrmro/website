# Github deploy from github action

```shell
kubectl --context ocean delete secret --namespace ncrmro-com regcred
kubectl --context ocean create secret --namespace ncrmro-com docker-registry regcred \
--docker-server=harbor.ncrmro.com --docker-username=robot\$ncrmro+ncrmro-website-kube-pull-secret \
--docker-password=YOKMy7ArUdN80olCW65pfSoNE59txy98
```