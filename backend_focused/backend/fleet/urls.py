from rest_framework.routers import SimpleRouter

from fleet.views import (
    MaintenanceRecordViewSet,
    MaintenanceTypeViewSet,
    MechanicViewSet,
    OfficeViewSet,
    VehicleViewSet,
)

router = SimpleRouter()
router.register("offices", OfficeViewSet)
router.register("vehicles", VehicleViewSet)
router.register("mechanics", MechanicViewSet)
router.register("maintenance-types", MaintenanceTypeViewSet)
router.register("maintenance-records", MaintenanceRecordViewSet)

urlpatterns = router.urls
