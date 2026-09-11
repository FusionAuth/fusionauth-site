from django.contrib import admin
from django.urls import include, path
from django.views.generic import RedirectView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('app/', include('app.urls')),
    path('oidc/', include('mozilla_django_oidc.urls')),
    path('', RedirectView.as_view(url='/app/', permanent=True)),
]
