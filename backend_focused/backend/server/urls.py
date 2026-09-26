from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView


urlpatterns = [
    path(
        'api/v1/schema/',
        SpectacularAPIView.as_view(permission_classes=[AllowAny]),
        name='schema',
    ),
    path(
        'api/v1/docs/',
        SpectacularSwaggerView.as_view(
            url_name='schema',
            permission_classes=[AllowAny],
        ),
        name='docs',
    ),
    path(
        'api/v1/auth/token/',
        TokenObtainPairView.as_view(permission_classes=[AllowAny]),
        name='token_obtain_pair',
    ),
    path(
        'api/v1/auth/token/refresh/',
        TokenRefreshView.as_view(permission_classes=[AllowAny]),
        name='token_refresh',
    ),
    path('api/v1/', include('fleet.urls')),
]
