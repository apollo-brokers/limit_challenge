from django.contrib import admin
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from fleet.views import VehicleViewSet
from maintenance.views import MaintenanceRecordViewSet, MechanicViewSet
from offices.views import OfficeViewSet

router = DefaultRouter()
router.register("offices", OfficeViewSet, basename="office")
router.register("vehicles", VehicleViewSet, basename="vehicle")
router.register("mechanics", MechanicViewSet, basename="mechanic")
router.register(
    "maintenance-records",
    MaintenanceRecordViewSet,
    basename="maintenance-record",
)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include(router.urls)),
]
