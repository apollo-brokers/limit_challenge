from datetime import timedelta

from django.db.models import F, Max, Q, QuerySet
from django.utils import timezone

from fleet.models import Vehicle
from offices.models import Office


class VehicleConflictError(Exception):
    def __init__(self, conflicts: list[str]):
        self.conflicts = conflicts
        super().__init__(", ".join(conflicts))


class VehicleService:
    def find_conflicts(
        self,
        vin: str,
        license_plate: str,
        active: bool = True,
        exclude_vehicle_id: int | None = None,
    ) -> list[str]:
        vehicles = Vehicle.objects.all()

        if exclude_vehicle_id is not None:
            vehicles = vehicles.exclude(pk=exclude_vehicle_id)

        conflicts = []

        if vehicles.filter(vin__iexact=vin).exists():
            conflicts.append("vin")

        if (
            active
            and vehicles.filter(
                license_plate__iexact=license_plate,
                active=True,
            ).exists()
        ):
            conflicts.append("license_plate")

        return conflicts

    def create(self, data: dict) -> Vehicle:
        conflicts = self.find_conflicts(
            vin=data["vin"],
            license_plate=data["license_plate"],
            active=data.get("active", True),
        )

        if conflicts:
            raise VehicleConflictError(conflicts)

        return Vehicle.objects.create(**data)

    def update(self, vehicle: Vehicle, changes: dict) -> Vehicle:
        vin = changes.get("vin", vehicle.vin)
        license_plate = changes.get("license_plate", vehicle.license_plate)
        active = changes.get("active", vehicle.active)

        conflicts = self.find_conflicts(
            vin=vin,
            license_plate=license_plate,
            active=active,
            exclude_vehicle_id=vehicle.id,
        )

        if conflicts:
            raise VehicleConflictError(conflicts)

        for field, value in changes.items():
            setattr(vehicle, field, value)

        if changes:
            vehicle.save(update_fields=list(changes))

        return vehicle

    def assign_office(self, vehicle: Vehicle, office: Office) -> Vehicle:
        vehicle.office = office
        vehicle.save(update_fields=["office"])
        return vehicle

    def find_needing_maintenance(self) -> QuerySet[Vehicle]:
        maintenance_cutoff = timezone.localdate() - timedelta(days=365)

        return (
            Vehicle.objects.filter(active=True)
            .annotate(last_maintenance=Max("maintenance_records__maintenance_date"))
            .filter(
                Q(last_maintenance__isnull=True)
                | Q(last_maintenance__lt=maintenance_cutoff)
            )
            .order_by(F("last_maintenance").asc(nulls_first=True), "id")
        )
