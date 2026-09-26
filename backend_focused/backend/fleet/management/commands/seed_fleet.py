from datetime import timedelta
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from fleet.models import (
    MaintenanceRecord,
    MaintenanceType,
    Mechanic,
    Office,
    Vehicle,
)


# These command-owned note values identify maintenance fixtures across reruns.
_RECENT_MAINTENANCE_FIXTURE_NOTE = "Recent scheduled service."
_SECOND_MAINTENANCE_FIXTURE_NOTE = (
    "Second record for maintenance history testing."
)
_STALE_MAINTENANCE_FIXTURE_NOTE = (
    "Most recent service is more than 365 days old."
)


class Command(BaseCommand):
    help = "Create a compact deterministic Fleet development dataset."

    @transaction.atomic
    def handle(self, *args, **options):
        offices = {}
        for name, city in (
            ("Calgary Operations", "Calgary"),
            ("Edmonton Operations", "Edmonton"),
            ("Vancouver Operations", "Vancouver"),
        ):
            office, _ = Office.objects.update_or_create(
                name=name,
                defaults={"city": city},
            )
            offices[name] = office

        mechanics = {}
        for name, certification_number, active in (
            ("Jordan Lee", "CERT-SEED-001", True),
            ("Morgan Chen", "CERT-SEED-002", True),
            ("Taylor Singh", "CERT-SEED-003", False),
        ):
            mechanic, _ = Mechanic.objects.update_or_create(
                certification_number=certification_number,
                defaults={"name": name, "active": active},
            )
            mechanics[certification_number] = mechanic

        maintenance_types = {}
        for name in ("Oil Change", "Tire Rotation", "Brake Service", "Inspection"):
            maintenance_type, _ = MaintenanceType.objects.get_or_create(name=name)
            maintenance_types[name] = maintenance_type

        vehicles = {}
        for vin, defaults in (
            (
                "1FTBR1C80NKA10001",
                {
                    "license_plate": "FLT-NONE",
                    "make": "Ram",
                    "model": "ProMaster",
                    "year": 2023,
                    "office": offices["Calgary Operations"],
                    "active": True,
                },
            ),
            (
                "1FTBR1C80NKA10002",
                {
                    "license_plate": "FLT-RECENT",
                    "make": "Ford",
                    "model": "Transit",
                    "year": 2022,
                    "office": offices["Calgary Operations"],
                    "active": True,
                },
            ),
            (
                "1FTBR1C80NKA10003",
                {
                    "license_plate": "FLT-STALE",
                    "make": "Chevrolet",
                    "model": "Express",
                    "year": 2019,
                    "office": offices["Edmonton Operations"],
                    "active": True,
                },
            ),
            (
                "1FTBR1C80NKA10004",
                {
                    "license_plate": "FLT-REUSE",
                    "make": "Ford",
                    "model": "F-150",
                    "year": 2024,
                    "office": offices["Vancouver Operations"],
                    "active": True,
                },
            ),
            (
                "1FTBR1C80NKA10005",
                {
                    "license_plate": "FLT-REUSE",
                    "make": "Ford",
                    "model": "F-150",
                    "year": 2018,
                    "office": offices["Edmonton Operations"],
                    "active": False,
                },
            ),
        ):
            vehicle, _ = Vehicle.objects.update_or_create(vin=vin, defaults=defaults)
            vehicles[vin] = vehicle

        today = timezone.localdate()
        for vehicle, notes, defaults in (
            (
                vehicles["1FTBR1C80NKA10002"],
                _RECENT_MAINTENANCE_FIXTURE_NOTE,
                {
                    "mechanic": mechanics["CERT-SEED-001"],
                    "type": maintenance_types["Oil Change"],
                    "performed_on": today - timedelta(days=30),
                    "cost": Decimal("189.50"),
                },
            ),
            (
                vehicles["1FTBR1C80NKA10002"],
                _SECOND_MAINTENANCE_FIXTURE_NOTE,
                {
                    "mechanic": mechanics["CERT-SEED-002"],
                    "type": maintenance_types["Brake Service"],
                    "performed_on": today - timedelta(days=180),
                    "cost": Decimal("275.00"),
                },
            ),
            (
                vehicles["1FTBR1C80NKA10003"],
                _STALE_MAINTENANCE_FIXTURE_NOTE,
                {
                    "mechanic": mechanics["CERT-SEED-003"],
                    "type": maintenance_types["Inspection"],
                    "performed_on": today - timedelta(days=400),
                    "cost": Decimal("640.00"),
                },
            ),
        ):
            MaintenanceRecord.objects.update_or_create(
                vehicle=vehicle,
                notes=notes,
                defaults=defaults,
            )

        self.stdout.write(
            "Fleet seed data ready: 3 offices, 5 vehicles, "
            "3 mechanics, 4 maintenance types, 3 maintenance records."
        )
