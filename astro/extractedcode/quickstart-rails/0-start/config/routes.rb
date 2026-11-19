Rails.application.routes.draw do
  root 'notes#show'
  post 'save', to: 'notes#save'
end
