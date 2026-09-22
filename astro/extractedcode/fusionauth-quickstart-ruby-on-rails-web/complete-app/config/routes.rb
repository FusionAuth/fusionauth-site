Rails.application.routes.draw do
  get 'make_change', to: "make_change#index"
  get 'logout', to: 'auth#logout'
  get 'auth/:provider/callback', to: 'auth#callback'
  root to: 'home#index'
end
