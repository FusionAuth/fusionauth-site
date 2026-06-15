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

