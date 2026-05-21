function populate(samlResponse, user, registration) {
  // Set an attribute named 'roles' from the User assigned roles for this registration
  samlResponse.assertion.attributes['roles'] = registration.roles || [];
  // Set an attribute named 'favoriteColor' using the custom data attribute named 'favoriteColor'
  samlResponse.assertion.attributes['favoriteColor'] = [user.data.favoriteColor];
}
