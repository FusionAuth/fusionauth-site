Rails.application.routes.draw do
  root 'notes#show'
  post 'save', to: 'notes#save'

  get 'login', to: 'sessions#new'
  get 'oauth-callback', to: 'sessions#create'
  get 'logout', to: 'sessions#destroy'
end
