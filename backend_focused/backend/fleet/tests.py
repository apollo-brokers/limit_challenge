from datetime import date, timedelta
from decimal import Decimal

from django.test import TestCase
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from fleet.models import MaintenanceRecord, Mechanic, Office, Vehicle


class FleetAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.office_a = Office.objects.create(name="New York", city="New York")
        self.office_b = Office.objects.create(name="Chicago Hub", city="Chicago")
        self.mechanic = Mechanic.objects.create(
            name="Alex Rivera",
            certification_number="CERT-1001",
            is_active=True,
        )
        self.mechanic_b = Mechanic.objects.create(
            name="Blake Chen",
            certification_number="CERT-2002",
            is_active=True,
        )
        self.vehicle = Vehicle.objects.create(
            vin="1HGCM82633A004352",
            license_plate="ABC-1234",
            make="Toyota",
            model="Camry",
            year=2020,
            office=self.office_a,
            is_active=True,
        )
        self.today = timezone.localdate()


class OfficeCRUDTests(FleetAPITestCase):
    def test_create_and_list_offices(self):
        response = self.client.post(
            "/api/offices/",
            {"name": "Dallas Yard", "city": "Dallas"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        response = self.client.get("/api/offices/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(response.data["count"], 3)


class VehicleConstraintTests(FleetAPITestCase):
    def test_vin_must_be_unique(self):
        response = self.client.post(
            "/api/vehicles/",
            {
                "vin": "1HGCM82633A004352",
                "license_plate": "ZZZ-9999",
                "make": "Ford",
                "model": "F-150",
                "year": 2021,
                "office_id": self.office_a.id,
                "is_active": True,
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("vin", response.data)

    def test_active_license_plate_uniqueness(self):
        response = self.client.post(
            "/api/vehicles/",
            {
                "vin": "2HGCM82633A004999",
                "license_plate": "ABC-1234",
                "make": "Ford",
                "model": "F-150",
                "year": 2021,
                "office_id": self.office_a.id,
                "is_active": True,
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("license_plate", response.data)

    def test_inactive_vehicle_allows_plate_reuse(self):
        self.vehicle.is_active = False
        self.vehicle.save(update_fields=["is_active"])

        response = self.client.post(
            "/api/vehicles/",
            {
                "vin": "2HGCM82633A004999",
                "license_plate": "ABC-1234",
                "make": "Ford",
                "model": "F-150",
                "year": 2021,
                "office_id": self.office_b.id,
                "is_active": True,
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)


class VehicleSearchTests(FleetAPITestCase):
    def setUp(self):
        super().setUp()
        self.vehicle_b = Vehicle.objects.create(
            vin="3HGCM82633A004111",
            license_plate="DEF-5678",
            make="Ford",
            model="F-150",
            year=2019,
            office=self.office_b,
            is_active=False,
        )
        MaintenanceRecord.objects.create(
            vehicle=self.vehicle,
            mechanic=self.mechanic,
            maintenance_date=self.today - timedelta(days=10),
            maintenance_type="Oil Change",
            cost=Decimal("79.99"),
            notes="",
        )
        MaintenanceRecord.objects.create(
            vehicle=self.vehicle_b,
            mechanic=self.mechanic_b,
            maintenance_date=self.today - timedelta(days=40),
            maintenance_type="Brakes",
            cost=Decimal("300.00"),
            notes="",
        )

    def test_filter_by_office_and_make(self):
        response = self.client.get(
            "/api/vehicles/search/",
            {"office": self.office_a.id, "make": "Toyota"},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        vins = [item["vin"] for item in response.data["results"]]
        self.assertEqual(vins, [self.vehicle.vin])

    def test_filter_by_active_false(self):
        response = self.client.get("/api/vehicles/search/", {"active": "false"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        vins = [item["vin"] for item in response.data["results"]]
        self.assertEqual(vins, [self.vehicle_b.vin])

    def test_filter_by_maintenance_dates_and_cert(self):
        response = self.client.get(
            "/api/vehicles/search/",
            {
                "maintained_from": (self.today - timedelta(days=15)).isoformat(),
                "maintained_to": self.today.isoformat(),
                "mechanic_certification": "CERT-1001",
            },
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        vins = [item["vin"] for item in response.data["results"]]
        self.assertEqual(vins, [self.vehicle.vin])

    def test_invalid_date_range(self):
        response = self.client.get(
            "/api/vehicles/search/",
            {
                "maintained_from": self.today.isoformat(),
                "maintained_to": (self.today - timedelta(days=1)).isoformat(),
            },
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class OfficeSummaryTests(FleetAPITestCase):
    def test_office_summary_aggregates(self):
        MaintenanceRecord.objects.create(
            vehicle=self.vehicle,
            mechanic=self.mechanic,
            maintenance_date=self.today - timedelta(days=30),
            maintenance_type="Oil Change",
            cost=Decimal("100.50"),
            notes="",
        )
        MaintenanceRecord.objects.create(
            vehicle=self.vehicle,
            mechanic=self.mechanic,
            maintenance_date=self.today - timedelta(days=400),
            maintenance_type="Old Job",
            cost=Decimal("999.00"),
            notes="",
        )

        response = self.client.get("/api/offices/summary/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        ny = next(item for item in response.data if item["name"] == "New York")
        self.assertEqual(ny["active_vehicle_count"], 1)
        self.assertEqual(Decimal(ny["maintenance_cost_last_year"]), Decimal("100.50"))
        self.assertEqual(ny["last_maintenance"], (self.today - timedelta(days=30)).isoformat())


class VehicleDetailAndHistoryTests(FleetAPITestCase):
    def test_details_include_office_and_mechanics(self):
        MaintenanceRecord.objects.create(
            vehicle=self.vehicle,
            mechanic=self.mechanic,
            maintenance_date=self.today - timedelta(days=1),
            maintenance_type="Inspection",
            cost=Decimal("50.00"),
            notes="ok",
        )
        response = self.client.get(f"/api/vehicles/{self.vehicle.id}/details/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["office"]["name"], "New York")
        self.assertEqual(len(response.data["maintenance_history"]), 1)
        self.assertEqual(
            response.data["maintenance_history"][0]["mechanic"]["certification_number"],
            "CERT-1001",
        )

    def test_history_ordered_newest_first(self):
        older = MaintenanceRecord.objects.create(
            vehicle=self.vehicle,
            mechanic=self.mechanic,
            maintenance_date=self.today - timedelta(days=20),
            maintenance_type="A",
            cost=Decimal("10.00"),
        )
        newer = MaintenanceRecord.objects.create(
            vehicle=self.vehicle,
            mechanic=self.mechanic,
            maintenance_date=self.today - timedelta(days=2),
            maintenance_type="B",
            cost=Decimal("20.00"),
        )
        response = self.client.get(
            f"/api/vehicles/{self.vehicle.id}/maintenance-history/"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        ids = [item["id"] for item in response.data["results"]]
        self.assertEqual(ids, [newer.id, older.id])


class AssignVehicleTests(FleetAPITestCase):
    def test_assign_moves_office_only(self):
        response = self.client.post(
            f"/api/vehicles/{self.vehicle.id}/assign/",
            {"office_id": self.office_b.id},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.vehicle.refresh_from_db()
        self.assertEqual(self.vehicle.office_id, self.office_b.id)
        self.assertEqual(response.data["office"]["id"], self.office_b.id)


class MechanicWorkloadTests(FleetAPITestCase):
    def test_workload_current_year_and_ordering(self):
        MaintenanceRecord.objects.create(
            vehicle=self.vehicle,
            mechanic=self.mechanic,
            maintenance_date=date(self.today.year, 1, 15),
            maintenance_type="A",
            cost=Decimal("100.00"),
        )
        MaintenanceRecord.objects.create(
            vehicle=self.vehicle,
            mechanic=self.mechanic,
            maintenance_date=date(self.today.year, 2, 15),
            maintenance_type="B",
            cost=Decimal("50.00"),
        )
        MaintenanceRecord.objects.create(
            vehicle=self.vehicle,
            mechanic=self.mechanic_b,
            maintenance_date=date(self.today.year, 3, 15),
            maintenance_type="C",
            cost=Decimal("25.00"),
        )
        # Prior year should be ignored
        MaintenanceRecord.objects.create(
            vehicle=self.vehicle,
            mechanic=self.mechanic,
            maintenance_date=date(self.today.year - 1, 6, 1),
            maintenance_type="Old",
            cost=Decimal("1000.00"),
        )

        response = self.client.get("/api/mechanics/workload/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[0]["name"], "Alex Rivera")
        self.assertEqual(response.data[0]["records_this_year"], 2)
        self.assertEqual(
            Decimal(response.data[0]["total_cost_this_year"]),
            Decimal("150.00"),
        )


class NeedingMaintenanceTests(FleetAPITestCase):
    def test_never_and_overdue_vehicles(self):
        overdue = Vehicle.objects.create(
            vin="4HGCM82633A004222",
            license_plate="OLD-9999",
            make="Honda",
            model="Civic",
            year=2018,
            office=self.office_a,
            is_active=True,
        )
        MaintenanceRecord.objects.create(
            vehicle=overdue,
            mechanic=self.mechanic,
            maintenance_date=self.today - timedelta(days=400),
            maintenance_type="Old",
            cost=Decimal("10.00"),
        )
        # Never maintained: self.vehicle
        # Fresh vehicle should be excluded
        fresh = Vehicle.objects.create(
            vin="5HGCM82633A004333",
            license_plate="NEW-1111",
            make="Honda",
            model="Accord",
            year=2022,
            office=self.office_a,
            is_active=True,
        )
        MaintenanceRecord.objects.create(
            vehicle=fresh,
            mechanic=self.mechanic,
            maintenance_date=self.today - timedelta(days=10),
            maintenance_type="Fresh",
            cost=Decimal("10.00"),
        )

        response = self.client.get("/api/vehicles/needing-maintenance/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        vins = [item["vin"] for item in response.data["results"]]
        self.assertIn(self.vehicle.vin, vins)
        self.assertIn(overdue.vin, vins)
        self.assertNotIn(fresh.vin, vins)
        # Never-maintained should come before overdue (nulls first)
        self.assertEqual(vins[0], self.vehicle.vin)


class DuplicateCheckTests(FleetAPITestCase):
    def test_duplicate_check_reports_conflicts(self):
        response = self.client.post(
            "/api/vehicles/duplicate-check/",
            {"vin": self.vehicle.vin, "license_plate": self.vehicle.license_plate},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            sorted(response.data["conflicts"]),
            ["license_plate", "vin"],
        )

    def test_duplicate_check_ignores_inactive_plate(self):
        self.vehicle.is_active = False
        self.vehicle.save(update_fields=["is_active"])
        response = self.client.post(
            "/api/vehicles/duplicate-check/",
            {"vin": "NEWIN12345678901", "license_plate": self.vehicle.license_plate},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["conflicts"], [])

    def test_duplicate_check_skips_plate_when_inactive_payload(self):
        # Inactive registration may reuse an active plate; VIN still conflicts.
        response = self.client.post(
            "/api/vehicles/duplicate-check/",
            {
                "vin": "NEWIN12345678901",
                "license_plate": self.vehicle.license_plate,
                "is_active": False,
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["conflicts"], [])


class MechanicCRUDTests(FleetAPITestCase):
    def test_mechanic_crud(self):
        create = self.client.post(
            "/api/mechanics/",
            {
                "name": "Casey Lee",
                "certification_number": "CERT-9999",
                "is_active": True,
            },
            format="json",
        )
        self.assertEqual(create.status_code, status.HTTP_201_CREATED)
        mechanic_id = create.data["id"]

        detail = self.client.get(f"/api/mechanics/{mechanic_id}/")
        self.assertEqual(detail.status_code, status.HTTP_200_OK)
        self.assertEqual(detail.data["certification_number"], "CERT-9999")

        update = self.client.patch(
            f"/api/mechanics/{mechanic_id}/",
            {"is_active": False},
            format="json",
        )
        self.assertEqual(update.status_code, status.HTTP_200_OK)
        self.assertFalse(update.data["is_active"])

        delete = self.client.delete(f"/api/mechanics/{mechanic_id}/")
        self.assertEqual(delete.status_code, status.HTTP_204_NO_CONTENT)


class MaintenanceRecordCRUDTests(FleetAPITestCase):
    def test_maintenance_record_crud(self):
        create = self.client.post(
            "/api/maintenance-records/",
            {
                "vehicle_id": self.vehicle.id,
                "mechanic_id": self.mechanic.id,
                "maintenance_date": self.today.isoformat(),
                "maintenance_type": "Tire Rotation",
                "cost": "120.50",
                "notes": "Rotated all four",
            },
            format="json",
        )
        self.assertEqual(create.status_code, status.HTTP_201_CREATED)
        record_id = create.data["id"]
        self.assertEqual(create.data["maintenance_type"], "Tire Rotation")
        self.assertEqual(create.data["mechanic"]["certification_number"], "CERT-1001")

        detail = self.client.get(f"/api/maintenance-records/{record_id}/")
        self.assertEqual(detail.status_code, status.HTTP_200_OK)

        update = self.client.patch(
            f"/api/maintenance-records/{record_id}/",
            {"cost": "130.00"},
            format="json",
        )
        self.assertEqual(update.status_code, status.HTTP_200_OK)
        self.assertEqual(Decimal(update.data["cost"]), Decimal("130.00"))

        delete = self.client.delete(f"/api/maintenance-records/{record_id}/")
        self.assertEqual(delete.status_code, status.HTTP_204_NO_CONTENT)


class VehicleCRUDTests(FleetAPITestCase):
    def test_vehicle_update_and_delete(self):
        update = self.client.patch(
            f"/api/vehicles/{self.vehicle.id}/",
            {"model": "Corolla"},
            format="json",
        )
        self.assertEqual(update.status_code, status.HTTP_200_OK)
        self.assertEqual(update.data["model"], "Corolla")

        delete = self.client.delete(f"/api/vehicles/{self.vehicle.id}/")
        self.assertEqual(delete.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Vehicle.objects.filter(pk=self.vehicle.id).exists())

    def test_assign_ignores_list_filters_on_querystring(self):
        # List filters must not make detail actions 404.
        response = self.client.post(
            f"/api/vehicles/{self.vehicle.id}/assign/?active=false&make=Nope",
            {"office_id": self.office_b.id},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.vehicle.refresh_from_db()
        self.assertEqual(self.vehicle.office_id, self.office_b.id)

    def test_details_query_count_stable_with_many_records(self):
        for i in range(40):
            MaintenanceRecord.objects.create(
                vehicle=self.vehicle,
                mechanic=self.mechanic,
                maintenance_date=self.today - timedelta(days=i + 1),
                maintenance_type="Bulk",
                cost=Decimal("11.00"),
            )
        with self.assertNumQueries(2):
            response = self.client.get(f"/api/vehicles/{self.vehicle.id}/details/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data["maintenance_history"]), 40)


class ProtectedDeleteTests(FleetAPITestCase):
    def test_cannot_delete_office_with_vehicles(self):
        response = self.client.delete(f"/api/offices/{self.office_a.id}/")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_cannot_delete_mechanic_with_records(self):
        MaintenanceRecord.objects.create(
            vehicle=self.vehicle,
            mechanic=self.mechanic,
            maintenance_date=self.today,
            maintenance_type="Check",
            cost=Decimal("1.00"),
        )
        response = self.client.delete(f"/api/mechanics/{self.mechanic.id}/")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
