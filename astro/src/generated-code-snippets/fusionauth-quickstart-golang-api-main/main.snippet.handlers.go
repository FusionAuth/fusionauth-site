func handleRequests() {
  http.Handle("/make-change", isAuthorized(makeChange))
  http.Handle("/panic", isAuthorized(panic))
  log.Fatal(http.ListenAndServe(":9001", nil))
}

