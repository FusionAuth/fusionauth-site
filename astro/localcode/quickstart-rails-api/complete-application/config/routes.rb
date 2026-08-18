Rails.application.routes.draw do
  resources :make_change, :path => '/make-change'
  resources :panic, :path => '/panic'
end
