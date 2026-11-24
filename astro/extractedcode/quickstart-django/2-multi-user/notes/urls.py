from django.urls import path
from django.views.decorators.http import require_GET, require_POST

from . import views

urlpatterns = [
    path('', require_GET(views.home)),
    path('save', require_POST(views.save)),
    path('login', require_GET(views.login)),
    path('oauth-callback', require_GET(views.oauth_callback)),
    path('logout', require_GET(views.logout)),
]
