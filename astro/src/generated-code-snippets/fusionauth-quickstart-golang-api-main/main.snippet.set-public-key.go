func setPublicKey(kid string) {
  if verifyKey == nil {
    response, err := http.Get("http://localhost:9011/api/jwt/public-key?kid=" + kid)
    if err != nil {
      log.Fatalln(err)
    }

    responseData, err := io.ReadAll(response.Body)
    if err != nil {
      log.Fatal(err)
    }

    var publicKey map[string]interface{}

    json.Unmarshal(responseData, &publicKey)

    var publicKeyPEM = publicKey["publicKey"].(string)

    var verifyBytes = []byte(publicKeyPEM)
    verifyKey, err = jwt.ParseRSAPublicKeyFromPEM(verifyBytes)

    if err != nil {
      log.Fatalln(("problem retreiving public key"))
    }
  }
}

