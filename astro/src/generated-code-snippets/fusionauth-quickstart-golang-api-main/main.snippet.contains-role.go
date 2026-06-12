// function for finding the intersection of two arrays
func containsRole(roles []string, rolesToCheck []string) []string {
  intersection := make([]string, 0)

  set := make(map[string]bool)

  // Create a set from the first array
  for _, role := range roles {
    set[role] = true // setting the initial value to true
  }

  // Check elements in the second array against the set
  for _, role := range rolesToCheck {
    if set[role] {
      intersection = append(intersection, role)
    }
  }

  return intersection
}

