from django.urls import path
from . import views

urlpatterns = [
    path('', views.app, name='app'),
    path('account/', views.account, name='account'),
    path('logout/', views.logout, name='logout'),
    path('change/', views.change, name='change'),
]
