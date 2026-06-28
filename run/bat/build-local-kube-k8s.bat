
PUSHD "./../../infra/local/kube/k8s/"
kubectl kustomize .
kubectl apply -k .
POPD