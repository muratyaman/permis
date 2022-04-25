TODO

Create certificate files:

```sh
# generate a private key
openssl genrsa -out privateKey.pem 3072

# generate public key
openssl rsa -in privateKey.pem -pubout -out publicKey.pem
```
