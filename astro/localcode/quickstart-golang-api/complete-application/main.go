// :snippet-start: packageImports
package main

import (
  "crypto/rsa"
  "encoding/json"
  "errors"
  "fmt"
  "io"
  "log"
  "math"
  "net/http"
  "reflect"
  "runtime"
  "sort"
  "strconv"
  "strings"

  "github.com/golang-jwt/jwt/v4"
)

// :snippet-end:

// :snippet-start: defineStruct
type ChangeResponse struct {
  Message string
  Change  []DenominationCounter
}

type DenominationCounter struct {
  Denomination string
  Count        int
}

// :snippet-end:

// :snippet-start: verifyKey
var verifyKey *rsa.PublicKey

// :snippet-end:

// :snippet-start: main
func main() {
  fmt.Println("server")
  handleRequests()
}

// :snippet-end:

// :snippet-start: handlers
func handleRequests() {
  http.Handle("/make-change", isAuthorized(makeChange))
  http.Handle("/panic", isAuthorized(panic))
  log.Fatal(http.ListenAndServe(":9001", nil))
}

// :snippet-end:

// :snippet-start: panicFunction
func panic(w http.ResponseWriter, r *http.Request) {
  message := ""
  var status int

  switch r.Method {
  case "POST":
    message = "We've called the police!"
    status = http.StatusOK
  default:
    message = "Only POST method is supported."
    status = http.StatusNotImplemented
  }

  responseObject := make(map[string]string)
  responseObject["message"] = message

  SetWriterReturn(w, status, responseObject)
}

// :snippet-end:

// :snippet-start: makeChangeFunction
func makeChange(w http.ResponseWriter, r *http.Request) {
  response := ChangeResponse{}

  switch r.Method {
  case "GET":
    var total = r.URL.Query().Get("total")
    var message = "We can make change using"
    remainingAmount, err := strconv.ParseFloat(total, 64)
    if err != nil {
      responseObject := make(map[string]string)
      responseObject["message"] = "Problem converting the submitted value to a decimal.  Value submitted: " + total
      SetWriterReturn(w, http.StatusBadRequest, responseObject)
      return
    }

    coins := make(map[float64]string)
    coins[.25] = "quarters"
    coins[.10] = "dimes"
    coins[.05] = "nickels"
    coins[.01] = "pennies"

    // a map is unordered, so maintain a separate ordered list
    denominationOrder := make([]float64, 0, len(coins))
    for value := range coins {
      denominationOrder = append(denominationOrder, value)
    }

    sort.Slice(denominationOrder, func(i, j int) bool {
      return denominationOrder[i] > denominationOrder[j]
    })

    for counter := range denominationOrder {
      value := denominationOrder[counter]
      coinName := coins[value]
      coinCount := int(remainingAmount / value)
      remainingAmount -= float64(coinCount) * value
      remainingAmount = math.Round(remainingAmount*100) / 100

      message += " " + strconv.Itoa(coinCount) + " " + coinName
      denominationCount := DenominationCounter{}
      denominationCount.Denomination = coinName
      denominationCount.Count = coinCount
      response.Change = append(response.Change, denominationCount)
    }
    response.Message = message

    SetWriterReturn(w, http.StatusOK, response)

  default:
    responseObject := make(map[string]string)
    responseObject["message"] = "Only GET method is supported."
    SetWriterReturn(w, http.StatusNotImplemented, responseObject)
  }

}

// :snippet-end:

// :snippet-start: authorization
func isAuthorized(endpoint func(http.ResponseWriter, *http.Request)) http.Handler {
  return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
    reqToken := ""
    tokenCookie, err := r.Cookie("app.at")
    if err != nil {
      if errors.Is(err, http.ErrNoCookie) {
        authHeader := r.Header.Get("Authorization")
        splitToken := strings.Split(authHeader, "Bearer ")
        if len(splitToken) > 1 {
          reqToken = splitToken[1]
        }
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

// :snippet-end:

// :snippet-start: setPublicKey
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

// :snippet-end:

// :snippet-start: containsRole
func containsRole(roles []string, rolesToCheck []string) []string {
  intersection := make([]string, 0)

  set := make(map[string]bool)

  for _, role := range roles {
    set[role] = true
  }

  for _, role := range rolesToCheck {
    if set[role] {
      intersection = append(intersection, role)
    }
  }

  return intersection
}

// :snippet-end:

// :snippet-start: helper
func GetFunctionName(i interface{}) string {
  return runtime.FuncForPC(reflect.ValueOf(i).Pointer()).Name()
}

func SetWriterReturn(w http.ResponseWriter, statusCode int, returnObject interface{}) {
  w.Header().Set("Content-Type", "application/json")
  w.WriteHeader(statusCode)
  jsonResp, err := json.Marshal(returnObject)
  if err != nil {
    log.Fatalf("Error happened in JSON marshal. Err: %s", err)
  }
  w.Write(jsonResp)
}

// :snippet-end:
