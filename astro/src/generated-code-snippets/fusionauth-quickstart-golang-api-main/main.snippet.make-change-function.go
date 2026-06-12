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

    //since a map is an unordered list, we need another list to maintain the order
    denominationOrder := make([]float64, 0, len(coins))
    for value := range coins {
      denominationOrder = append(denominationOrder, value)
    }

    //then we order the list
    sort.Slice(denominationOrder, func(i, j int) bool {
      return denominationOrder[i] > denominationOrder[j]
    })

    //for each coin in the list, we figure out how many will fit into the remainingAmount
    for counter := range denominationOrder {
      value := denominationOrder[counter]
      coinName := coins[value]
      coinCount := int(remainingAmount / value)
      remainingAmount -= float64(coinCount) * value
      //had to add this to help with floating point rounding issues.
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

