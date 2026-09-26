from datetime import date, timedelta
from decimal import Decimal
from io import StringIO
from unittest.mock import patch

from django.core.management import call_command
from django.db.models import Count, Max
from django.test import TestCase

from fleet.models import (
    MaintenanceRecord,
    MaintenanceType,
    Mechanic,
    Office,
    Vehicle,
)


class SeedFleetCommandTests(TestCase):
    today = date(2026, 9, 26)

    def run_seed(self, local_date=None):
        stdout = StringIO()
        with patch(
            "fleet.management.commands.seed_fleet.timezone.localdate",
            return_value=local_date or self.today,
        ):
            call_command("seed_fleet", stdout=stdout)
        return stdout.getvalue()

    def test_seed_fleet_creates_required_development_scenarios(self):
        output = self.run_seed()

        self.assertEqual(Office.objects.count(), 3)
        self.assertEqual(Vehicle.objects.count(), 5)
        self.assertEqual(Mechanic.objects.count(), 3)
        self.assertEqual(MaintenanceType.objects.count(), 4)
        self.assertEqual(MaintenanceRecord.objects.count(), 3)
        self.assertEqual(
            set(MaintenanceType.objects.values_list("name", flat=True)),
            {"Oil Change", "Tire Rotation", "Brake Service", "Inspection"},
        )
        self.assertEqual(
            set(MaintenanceRecord.objects.values_list("type__name", flat=True)),
            {"Oil Change", "Brake Service", "Inspection"},
        )
        self.assertTrue(Vehicle.objects.filter(active=True).exists())
        self.assertTrue(Vehicle.objects.filter(active=False).exists())
        self.assertTrue(Mechanic.objects.filter(active=True).exists())
        self.assertTrue(Mechanic.objects.filter(active=False).exists())

        without_maintenance = Vehicle.objects.annotate(
            maintenance_count=Count("maintenance_records")
        ).filter(maintenance_count=0)
        self.assertTrue(without_maintenance.exists())

        recent_vehicle = Vehicle.objects.get(vin="1FTBR1C80NKA10002")
        self.assertEqual(
            recent_vehicle.maintenance_records.aggregate(latest=Max("performed_on"))[
                "latest"
            ],
            self.today - timedelta(days=30),
        )
        self.assertGreaterEqual(recent_vehicle.maintenance_records.count(), 2)
        self.assertGreaterEqual(
            recent_vehicle.maintenance_records.values("mechanic_id")
            .distinct()
            .count(),
            2,
        )

        stale_vehicle = Vehicle.objects.get(vin="1FTBR1C80NKA10003")
        stale_latest_date = stale_vehicle.maintenance_records.aggregate(
            latest=Max("performed_on")
        )["latest"]
        self.assertLess(stale_latest_date, self.today - timedelta(days=365))

        reused_plate_vehicles = Vehicle.objects.filter(license_plate="FLT-REUSE")
        self.assertEqual(reused_plate_vehicles.count(), 2)
        self.assertEqual(reused_plate_vehicles.filter(active=True).count(), 1)
        self.assertEqual(reused_plate_vehicles.filter(active=False).count(), 1)
        self.assertEqual(
            output,
            "Fleet seed data ready: 3 offices, 5 vehicles, "
            "3 mechanics, 4 maintenance types, 3 maintenance records.\n",
        )

    def test_seed_fleet_is_rerunnable_without_duplicating_its_fixture(self):
        self.run_seed()
        office_ids = set(Office.objects.values_list("pk", flat=True))
        vehicle_ids = set(Vehicle.objects.values_list("pk", flat=True))
        mechanic_ids = set(Mechanic.objects.values_list("pk", flat=True))
        maintenance_type_ids = set(
            MaintenanceType.objects.values_list("pk", flat=True)
        )

        self.run_seed()
        self.run_seed(self.today + timedelta(days=1))

        self.assertEqual(Office.objects.count(), 3)
        self.assertEqual(Vehicle.objects.count(), 5)
        self.assertEqual(Mechanic.objects.count(), 3)
        self.assertEqual(MaintenanceType.objects.count(), 4)
        self.assertEqual(MaintenanceRecord.objects.count(), 3)
        self.assertEqual(
            set(Office.objects.values_list("pk", flat=True)),
            office_ids,
        )
        self.assertEqual(
            set(Vehicle.objects.values_list("pk", flat=True)),
            vehicle_ids,
        )
        self.assertEqual(
            set(Mechanic.objects.values_list("pk", flat=True)),
            mechanic_ids,
        )
        self.assertEqual(
            set(MaintenanceType.objects.values_list("pk", flat=True)),
            maintenance_type_ids,
        )
        self.assertEqual(
            MaintenanceRecord.objects.aggregate(latest=Max("performed_on"))["latest"],
            self.today + timedelta(days=1) - timedelta(days=30),
        )

    def test_seed_fleet_updates_mutable_fixture_attributes_in_place(self):
        self.run_seed()
        office = Office.objects.get(name="Calgary Operations")
        mechanic = Mechanic.objects.get(certification_number="CERT-SEED-001")
        office_id = office.pk
        mechanic_id = mechanic.pk
        office.city = "Changed city"
        office.save(update_fields=("city",))
        mechanic.name = "Changed name"
        mechanic.active = False
        mechanic.save(update_fields=("name", "active"))

        self.run_seed()

        self.assertEqual(Office.objects.count(), 3)
        self.assertEqual(Mechanic.objects.count(), 3)
        office.refresh_from_db()
        mechanic.refresh_from_db()
        self.assertEqual(office.pk, office_id)
        self.assertEqual(office.city, "Calgary")
        self.assertEqual(mechanic.pk, mechanic_id)
        self.assertEqual(mechanic.name, "Jordan Lee")
        self.assertTrue(mechanic.active)

    def test_seed_fleet_preserves_unrelated_records_on_seeded_vehicles(self):
        self.run_seed()
        vehicle = Vehicle.objects.get(vin="1FTBR1C80NKA10002")
        mechanic = Mechanic.objects.get(certification_number="CERT-SEED-001")
        maintenance_type = MaintenanceType.objects.get(name="Oil Change")
        manual_record = MaintenanceRecord.objects.create(
            vehicle=vehicle,
            mechanic=mechanic,
            type=maintenance_type,
            performed_on=self.today,
            cost=Decimal("99.00"),
            notes="Manually added maintenance.",
        )

        self.run_seed(self.today + timedelta(days=1))

        manual_record.refresh_from_db()
        self.assertEqual(manual_record.performed_on, self.today)
        self.assertEqual(MaintenanceRecord.objects.count(), 4)
        self.assertEqual(
            vehicle.maintenance_records.filter(
                notes="Recent scheduled service."
            ).count(),
            1,
        )
