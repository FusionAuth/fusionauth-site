type ChangeResponse struct {
  Message string
  Change  []DenominationCounter
}

type DenominationCounter struct {
  Denomination string
  Count        int
}

