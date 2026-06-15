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

