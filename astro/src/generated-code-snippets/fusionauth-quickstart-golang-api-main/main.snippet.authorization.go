func isAuthorized(endpoint func(http.ResponseWriter, *http.Request)) http.Handler {
  return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
    reqToken := ""
    tokenCookie, err := r.Cookie("app.at")
    if err != nil {
      if errors.Is(err, http.ErrNoCookie) {
        reqToken = r.Header.Get("Authorization")
        splitToken := strings.Split(reqToken, "Bearer ")
        reqToken = splitToken[1]
      }
    } else {
      reqToken = tokenCookie.Value
    }

    responseObject := make(map[string]string)
    if reqToken == "" {
      responseObject["message"] = "No Token provided"
      SetWriterReturn(w, http.StatusUnauthorized, responseObject)
    } else {
      token, err := jwt.Parse(reqToken, func(token *jwt.Token) (interface{}, error) {
        if _, ok := token.Method.(*jwt.SigningMethodRSA); !ok {
          return nil, fmt.Errorf(("invalid signing method"))
        }
        aud := "e9fdb985-9173-4e01-9d73-ac2d60d1dc8e"
        checkAudience := token.Claims.(jwt.MapClaims).VerifyAudience(aud, false)
        if !checkAudience {
          return nil, fmt.Errorf(("invalid aud"))
        }
        // verify iss claim
        iss := "http://localhost:9011"
        checkIss := token.Claims.(jwt.MapClaims).VerifyIssuer(iss, false)
        if !checkIss {
          return nil, fmt.Errorf(("invalid iss"))
        }

        setPublicKey(token.Header["kid"].(string))
        return verifyKey, nil
      })
      if err != nil {
        fmt.Fprint(w, err.Error())
        return
      }

      if token.Valid {
        var roles = token.Claims.(jwt.MapClaims)["roles"]
        var validRoles []string

        switch pageToGet := GetFunctionName((endpoint)); pageToGet {
        case "main.panic":
          validRoles = []string{"teller"}
        case "main.makeChange":
          validRoles = []string{"customer", "teller"}
        }

        result := containsRole([]string{roles.([]interface{})[0].(string)}, validRoles)

        if len(result) > 0 {
          endpoint(w, r)
        } else {
          responseObject := make(map[string]string)
          responseObject["message"] = "Proper role not found for user"
          SetWriterReturn(w, http.StatusUnauthorized, responseObject)
        }

      }

    }
  })
}

