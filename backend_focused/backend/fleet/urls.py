from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    MaintenanceRecordViewSet,
    MechanicViewSet,
    MechanicWorkloadView,
    OfficeSummaryView,
    OfficeViewSet,
    VehicleViewSet,
)

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
    path("offices/summary/", OfficeSummaryView.as_view(), name="office-summary"),
    path(
        "mechanics/workload/",
        MechanicWorkloadView.as_view(),
        name="mechanic-workload",
    ),
    path("", include(router.urls)),
]
