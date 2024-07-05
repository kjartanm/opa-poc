echo "set some file permissions"
touch "$(pwd)/src/opa/bundle.tar.gz"
chmod a+rw "$(pwd)/src/opa/bundle.tar.gz"
echo "run docker"
docker run -v "$(pwd)/src/opa:/src" openpolicyagent/opa build -t wasm -e example/allow ./src/todo.rego -o ./src/bundle.tar.gz
tar xfC "$(pwd)/src/opa/bundle.tar.gz" "$(pwd)/src/opa/" "/policy.wasm"
