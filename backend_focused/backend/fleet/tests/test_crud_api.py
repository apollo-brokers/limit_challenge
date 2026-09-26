from datetime import date
from decimal import Decimal

from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from fleet.models import (
    MaintenanceRecord,
    MaintenanceType,
    Mechanic,
    Office,
    Vehicle,
)

RESOURCE_URLS = (
    "/api/v1/offices/",
    "/api/v1/vehicles/",
    "/api/v1/mechanics/",
    "/api/v1/maintenance-types/",
    "/api/v1/maintenance-records/",
)


class FleetApiTestCase(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.user = get_user_model().objects.create_user(
            username="fleet-admin",
            password="a-secure-test-password",
        )
        cls.office = Office.objects.create(name="Calgary", city="Calgary")
        cls.other_office = Office.objects.create(name="Edmonton", city="Edmonton")
        cls.mechanic = Mechanic.objects.create(
            name="Alex Rivera",
            certification_number="CERT-001",
        )
        cls.maintenance_type = MaintenanceType.objects.create(name="Oil Change")

    def setUp(self):
        self.client.force_authenticate(self.user)

    def create_vehicle(self, *, vin, license_plate, office=None, active=True):
        return Vehicle.objects.create(
            vin=vin,
            license_plate=license_plate,
            make="Ford",
            model="Transit",
            year=2022,
            office=office or self.office,
            active=active,
        )

    def create_record(self, *, vehicle, mechanic=None, maintenance_type=None):
        return MaintenanceRecord.objects.create(
            vehicle=vehicle,
            mechanic=mechanic or self.mechanic,
            type=maintenance_type or self.maintenance_type,
            performed_on=date(2026, 1, 15),
            cost=Decimal("189.50"),
            notes="Routine service",
        )


class AuthenticationTests(APITestCase):
    username = "fleet-admin"
    password = "a-secure-test-password"

    @classmethod
    def setUpTestData(cls):
        get_user_model().objects.create_user(
            username=cls.username,
            password=cls.password,
        )

    def test_business_resources_require_authentication(self):
        for url in RESOURCE_URLS:
            with self.subTest(url=url):
                response = self.client.get(url)

                self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_jwt_access_token_grants_access_to_business_resources(self):
        token_response = self.client.post(
            "/api/v1/auth/token/",
            {"username": self.username, "password": self.password},
            format="json",
        )
        self.assertEqual(token_response.status_code, status.HTTP_200_OK)

        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {token_response.data['access']}"
        )
        response = self.client.post(
            "/api/v1/offices/",
            {"name": "Toronto", "city": "Toronto"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Office.objects.filter(name="Toronto").exists())


class CrudSchemaTests(APITestCase):
    def get_schema(self):
        response = self.client.get(
            "/api/v1/schema/",
            HTTP_ACCEPT="application/json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        return response.json()

    def test_schema_contains_crud_paths_protected_by_jwt(self):
        paths = self.get_schema()["paths"]

        for url in RESOURCE_URLS:
            with self.subTest(url=url):
                self.assertEqual(set(paths[url]), {"get", "post"})
                self.assertEqual(
                    set(paths[f"{url}{{id}}/"]),
                    {"get", "put", "patch", "delete"},
                )
                for operations in (paths[url], paths[f"{url}{{id}}/"]):
                    for operation in operations.values():
                        self.assertEqual(operation["security"], [{"jwtAuth": []}])

    def test_schema_documents_conflict_for_protected_deletes(self):
        paths = self.get_schema()["paths"]

        for url in (
            "/api/v1/offices/{id}/",
            "/api/v1/mechanics/{id}/",
            "/api/v1/maintenance-types/{id}/",
        ):
            with self.subTest(url=url):
                self.assertIn("409", paths[url]["delete"]["responses"])

    def test_schema_separates_nested_reads_from_id_writes(self):
        schemas = self.get_schema()["components"]["schemas"]

        self.assertIn("office", schemas["Vehicle"]["properties"])
        self.assertNotIn("office_id", schemas["Vehicle"]["properties"])
        self.assertIn("office_id", schemas["VehicleRequest"]["properties"])
        self.assertNotIn("office", schemas["VehicleRequest"]["properties"])
        self.assertEqual(
            set(schemas["MaintenanceRecordRequest"]["required"]),
            {"vehicle_id", "mechanic_id", "type_id", "performed_on", "cost"},
        )


class OfficeApiTests(FleetApiTestCase):
    def test_list_offices_is_ordered_by_name(self):
        response = self.client.get("/api/v1/offices/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 2)
        self.assertEqual(
            [office["name"] for office in response.data["results"]],
            ["Calgary", "Edmonton"],
        )

    def test_retrieve_office(self):
        response = self.client.get(f"/api/v1/offices/{self.office.pk}/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data,
            {"id": self.office.pk, "name": "Calgary", "city": "Calgary"},
        )

    def test_create_office(self):
        response = self.client.post(
            "/api/v1/offices/",
            {"name": "Vancouver", "city": "Vancouver"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["name"], "Vancouver")
        self.assertTrue(Office.objects.filter(pk=response.data["id"]).exists())

    def test_update_office(self):
        response = self.client.put(
            f"/api/v1/offices/{self.office.pk}/",
            {"name": "Calgary North", "city": "Calgary"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.office.refresh_from_db()
        self.assertEqual(self.office.name, "Calgary North")

    def test_delete_unreferenced_office(self):
        response = self.client.delete(f"/api/v1/offices/{self.other_office.pk}/")

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Office.objects.filter(pk=self.other_office.pk).exists())

    def test_delete_office_referenced_by_vehicle_returns_conflict(self):
        self.create_vehicle(vin="1FTBR1C80NKA00001", license_plate="AB-1001")

        response = self.client.delete(f"/api/v1/offices/{self.office.pk}/")

        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
        self.assertEqual(
            response.data,
            {
                "detail": "This object cannot be deleted because other records reference it."
            },
        )
        self.assertTrue(Office.objects.filter(pk=self.office.pk).exists())


class VehicleApiTests(FleetApiTestCase):
    def vehicle_payload(self, **overrides):
        payload = {
            "vin": "1FTBR1C80NKA09999",
            "license_plate": "ZZ-9999",
            "make": "Ford",
            "model": "Transit",
            "year": 2023,
            "active": True,
            "office_id": self.office.pk,
        }
        payload.update(overrides)
        return payload

    def test_list_vehicles_includes_nested_office(self):
        vehicle = self.create_vehicle(vin="1FTBR1C80NKA00001", license_plate="AB-1001")

        response = self.client.get("/api/v1/vehicles/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["id"], vehicle.pk)
        self.assertEqual(
            response.data["results"][0]["office"],
            {"id": self.office.pk, "name": "Calgary", "city": "Calgary"},
        )

    def test_retrieve_vehicle(self):
        vehicle = self.create_vehicle(vin="1FTBR1C80NKA00001", license_plate="AB-1001")

        response = self.client.get(f"/api/v1/vehicles/{vehicle.pk}/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data,
            {
                "id": vehicle.pk,
                "vin": "1FTBR1C80NKA00001",
                "license_plate": "AB-1001",
                "make": "Ford",
                "model": "Transit",
                "year": 2022,
                "active": True,
                "office": {"id": self.office.pk, "name": "Calgary", "city": "Calgary"},
            },
        )

    def test_create_vehicle_with_office_id(self):
        response = self.client.post(
            "/api/v1/vehicles/",
            self.vehicle_payload(),
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["office"]["id"], self.office.pk)
        self.assertNotIn("office_id", response.data)
        self.assertEqual(Vehicle.objects.get(pk=response.data["id"]).office, self.office)

    def test_put_vehicle(self):
        vehicle = self.create_vehicle(vin="1FTBR1C80NKA00001", license_plate="AB-1001")

        response = self.client.put(
            f"/api/v1/vehicles/{vehicle.pk}/",
            self.vehicle_payload(
                vin=vehicle.vin,
                license_plate="AB-2002",
                office_id=self.other_office.pk,
            ),
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        vehicle.refresh_from_db()
        self.assertEqual(vehicle.license_plate, "AB-2002")
        self.assertEqual(vehicle.office, self.other_office)

    def test_patch_vehicle(self):
        vehicle = self.create_vehicle(vin="1FTBR1C80NKA00001", license_plate="AB-1001")

        response = self.client.patch(
            f"/api/v1/vehicles/{vehicle.pk}/",
            {"model": "E-Transit"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        vehicle.refresh_from_db()
        self.assertEqual(vehicle.model, "E-Transit")

    def test_vehicle_can_keep_its_own_plate_on_update(self):
        vehicle = self.create_vehicle(vin="1FTBR1C80NKA00001", license_plate="AB-1001")

        put_response = self.client.put(
            f"/api/v1/vehicles/{vehicle.pk}/",
            self.vehicle_payload(vin=vehicle.vin, license_plate="AB-1001"),
            format="json",
        )
        patch_response = self.client.patch(
            f"/api/v1/vehicles/{vehicle.pk}/",
            {"license_plate": "AB-1001", "active": True},
            format="json",
        )

        self.assertEqual(put_response.status_code, status.HTTP_200_OK)
        self.assertEqual(patch_response.status_code, status.HTTP_200_OK)

    def test_delete_vehicle_cascades_maintenance_records(self):
        vehicle = self.create_vehicle(vin="1FTBR1C80NKA00001", license_plate="AB-1001")
        record = self.create_record(vehicle=vehicle)

        response = self.client.delete(f"/api/v1/vehicles/{vehicle.pk}/")

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Vehicle.objects.filter(pk=vehicle.pk).exists())
        self.assertFalse(MaintenanceRecord.objects.filter(pk=record.pk).exists())

    def test_duplicate_vin_is_rejected(self):
        self.create_vehicle(vin="1FTBR1C80NKA00001", license_plate="AB-1001")

        response = self.client.post(
            "/api/v1/vehicles/",
            self.vehicle_payload(vin="1FTBR1C80NKA00001"),
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("vin", response.data)

    def test_active_vehicle_cannot_reuse_active_plate(self):
        self.create_vehicle(vin="1FTBR1C80NKA00001", license_plate="AB-1001")

        response = self.client.post(
            "/api/v1/vehicles/",
            self.vehicle_payload(license_plate="AB-1001"),
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data,
            {
                "license_plate": [
                    "An active vehicle with this license plate already exists."
                ]
            },
        )

    def test_vehicle_without_active_flag_defaults_to_active_for_plate_check(self):
        self.create_vehicle(vin="1FTBR1C80NKA00001", license_plate="AB-1001")
        payload = self.vehicle_payload(license_plate="AB-1001")
        del payload["active"]

        response = self.client.post("/api/v1/vehicles/", payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("license_plate", response.data)

    def test_inactive_vehicle_can_reuse_active_plate(self):
        self.create_vehicle(vin="1FTBR1C80NKA00001", license_plate="AB-1001")

        response = self.client.post(
            "/api/v1/vehicles/",
            self.vehicle_payload(license_plate="AB-1001", active=False),
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertFalse(response.data["active"])

    def test_patch_changing_plate_to_active_plate_is_rejected(self):
        self.create_vehicle(vin="1FTBR1C80NKA00001", license_plate="AB-1001")
        vehicle = self.create_vehicle(vin="1FTBR1C80NKA00002", license_plate="AB-2002")

        response = self.client.patch(
            f"/api/v1/vehicles/{vehicle.pk}/",
            {"license_plate": "AB-1001"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("license_plate", response.data)

    def test_patch_activating_vehicle_with_conflicting_plate_is_rejected(self):
        self.create_vehicle(vin="1FTBR1C80NKA00001", license_plate="AB-1001")
        inactive_vehicle = self.create_vehicle(
            vin="1FTBR1C80NKA00002",
            license_plate="AB-1001",
            active=False,
        )

        response = self.client.patch(
            f"/api/v1/vehicles/{inactive_vehicle.pk}/",
            {"active": True},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("license_plate", response.data)
        inactive_vehicle.refresh_from_db()
        self.assertFalse(inactive_vehicle.active)

    def test_invalid_office_id_is_rejected(self):
        response = self.client.post(
            "/api/v1/vehicles/",
            self.vehicle_payload(office_id=999999),
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("office_id", response.data)


class MechanicApiTests(FleetApiTestCase):
    def test_list_and_retrieve_mechanics(self):
        list_response = self.client.get("/api/v1/mechanics/")
        detail_response = self.client.get(f"/api/v1/mechanics/{self.mechanic.pk}/")

        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(list_response.data["count"], 1)
        self.assertEqual(detail_response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            detail_response.data,
            {
                "id": self.mechanic.pk,
                "name": "Alex Rivera",
                "certification_number": "CERT-001",
                "active": True,
            },
        )

    def test_create_update_and_delete_mechanic(self):
        create_response = self.client.post(
            "/api/v1/mechanics/",
            {"name": "Sam Lee", "certification_number": "CERT-002"},
            format="json",
        )
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        mechanic_id = create_response.data["id"]

        update_response = self.client.patch(
            f"/api/v1/mechanics/{mechanic_id}/",
            {"active": False},
            format="json",
        )
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)
        self.assertFalse(Mechanic.objects.get(pk=mechanic_id).active)

        delete_response = self.client.delete(f"/api/v1/mechanics/{mechanic_id}/")
        self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Mechanic.objects.filter(pk=mechanic_id).exists())

    def test_delete_mechanic_referenced_by_record_returns_conflict(self):
        vehicle = self.create_vehicle(vin="1FTBR1C80NKA00001", license_plate="AB-1001")
        self.create_record(vehicle=vehicle)

        response = self.client.delete(f"/api/v1/mechanics/{self.mechanic.pk}/")

        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
        self.assertIn("detail", response.data)
        self.assertTrue(Mechanic.objects.filter(pk=self.mechanic.pk).exists())


class MaintenanceTypeApiTests(FleetApiTestCase):
    def test_list_and_retrieve_maintenance_types(self):
        list_response = self.client.get("/api/v1/maintenance-types/")
        detail_response = self.client.get(
            f"/api/v1/maintenance-types/{self.maintenance_type.pk}/"
        )

        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(list_response.data["count"], 1)
        self.assertEqual(
            detail_response.data,
            {"id": self.maintenance_type.pk, "name": "Oil Change"},
        )

    def test_create_update_and_delete_maintenance_type(self):
        create_response = self.client.post(
            "/api/v1/maintenance-types/",
            {"name": "Brake Inspection"},
            format="json",
        )
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        type_id = create_response.data["id"]

        update_response = self.client.put(
            f"/api/v1/maintenance-types/{type_id}/",
            {"name": "Brake Service"},
            format="json",
        )
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)
        self.assertEqual(MaintenanceType.objects.get(pk=type_id).name, "Brake Service")

        delete_response = self.client.delete(f"/api/v1/maintenance-types/{type_id}/")
        self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(MaintenanceType.objects.filter(pk=type_id).exists())

    def test_duplicate_maintenance_type_name_is_rejected(self):
        response = self.client.post(
            "/api/v1/maintenance-types/",
            {"name": "Oil Change"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("name", response.data)

    def test_delete_maintenance_type_referenced_by_record_returns_conflict(self):
        vehicle = self.create_vehicle(vin="1FTBR1C80NKA00001", license_plate="AB-1001")
        self.create_record(vehicle=vehicle)

        response = self.client.delete(
            f"/api/v1/maintenance-types/{self.maintenance_type.pk}/"
        )

        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
        self.assertIn("detail", response.data)
        self.assertTrue(
            MaintenanceType.objects.filter(pk=self.maintenance_type.pk).exists()
        )


class MaintenanceRecordApiTests(FleetApiTestCase):
    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()
        cls.vehicle = Vehicle.objects.create(
            vin="1FTBR1C80NKA00001",
            license_plate="AB-1001",
            make="Ford",
            model="Transit",
            year=2022,
            office=cls.office,
        )
        cls.other_mechanic = Mechanic.objects.create(
            name="Sam Lee",
            certification_number="CERT-002",
        )
        cls.other_type = MaintenanceType.objects.create(name="Tire Rotation")

    def record_payload(self, **overrides):
        payload = {
            "vehicle_id": self.vehicle.pk,
            "mechanic_id": self.mechanic.pk,
            "type_id": self.maintenance_type.pk,
            "performed_on": "2026-02-10",
            "cost": "189.50",
            "notes": "Replaced oil filter",
        }
        payload.update(overrides)
        return payload

    def test_retrieve_record_represents_related_objects(self):
        record = self.create_record(vehicle=self.vehicle)

        response = self.client.get(f"/api/v1/maintenance-records/{record.pk}/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data,
            {
                "id": record.pk,
                "vehicle": {
                    "id": self.vehicle.pk,
                    "vin": "1FTBR1C80NKA00001",
                    "license_plate": "AB-1001",
                    "make": "Ford",
                    "model": "Transit",
                },
                "mechanic": {
                    "id": self.mechanic.pk,
                    "name": "Alex Rivera",
                    "certification_number": "CERT-001",
                    "active": True,
                },
                "type": {"id": self.maintenance_type.pk, "name": "Oil Change"},
                "performed_on": "2026-01-15",
                "cost": "189.50",
                "notes": "Routine service",
            },
        )

    def test_list_records(self):
        self.create_record(vehicle=self.vehicle)

        response = self.client.get("/api/v1/maintenance-records/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)

    def test_create_record_with_id_fields(self):
        response = self.client.post(
            "/api/v1/maintenance-records/",
            self.record_payload(),
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["vehicle"]["id"], self.vehicle.pk)
        self.assertEqual(response.data["mechanic"]["id"], self.mechanic.pk)
        self.assertEqual(response.data["type"]["id"], self.maintenance_type.pk)
        self.assertEqual(response.data["cost"], "189.50")
        for field in ("vehicle_id", "mechanic_id", "type_id"):
            self.assertNotIn(field, response.data)

    def test_update_record_relationships_with_id_fields(self):
        record = self.create_record(vehicle=self.vehicle)

        put_response = self.client.put(
            f"/api/v1/maintenance-records/{record.pk}/",
            self.record_payload(mechanic_id=self.other_mechanic.pk),
            format="json",
        )
        patch_response = self.client.patch(
            f"/api/v1/maintenance-records/{record.pk}/",
            {"type_id": self.other_type.pk},
            format="json",
        )

        self.assertEqual(put_response.status_code, status.HTTP_200_OK)
        self.assertEqual(patch_response.status_code, status.HTTP_200_OK)
        record.refresh_from_db()
        self.assertEqual(record.mechanic, self.other_mechanic)
        self.assertEqual(record.type, self.other_type)
        self.assertEqual(record.performed_on, date(2026, 2, 10))

    def test_delete_record(self):
        record = self.create_record(vehicle=self.vehicle)

        response = self.client.delete(f"/api/v1/maintenance-records/{record.pk}/")

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(MaintenanceRecord.objects.filter(pk=record.pk).exists())

    def test_invalid_foreign_keys_are_rejected(self):
        for field in ("vehicle_id", "mechanic_id", "type_id"):
            with self.subTest(field=field):
                response = self.client.post(
                    "/api/v1/maintenance-records/",
                    self.record_payload(**{field: 999999}),
                    format="json",
                )

                self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
                self.assertIn(field, response.data)


class ListQueryCountTests(FleetApiTestCase):
    """List endpoints must not issue one extra query per row."""

    def test_vehicle_list_query_count_does_not_grow_with_rows(self):
        for index in range(5):
            self.create_vehicle(
                vin=f"1FTBR1C80NKA0000{index}",
                license_plate=f"AB-100{index}",
                office=self.office if index % 2 else self.other_office,
            )

        # One COUNT for pagination plus one SELECT joined with offices.
        with self.assertNumQueries(2):
            response = self.client.get("/api/v1/vehicles/")

        self.assertEqual(len(response.data["results"]), 5)

    def test_maintenance_record_list_query_count_does_not_grow_with_rows(self):
        other_mechanic = Mechanic.objects.create(
            name="Sam Lee",
            certification_number="CERT-002",
        )
        other_type = MaintenanceType.objects.create(name="Tire Rotation")
        for index in range(5):
            vehicle = self.create_vehicle(
                vin=f"1FTBR1C80NKA0000{index}",
                license_plate=f"AB-100{index}",
            )
            self.create_record(
                vehicle=vehicle,
                mechanic=other_mechanic if index % 2 else self.mechanic,
                maintenance_type=other_type if index % 2 else self.maintenance_type,
            )

        # One COUNT for pagination plus one SELECT joined with related tables.
        with self.assertNumQueries(2):
            response = self.client.get("/api/v1/maintenance-records/")

        self.assertEqual(len(response.data["results"]), 5)
