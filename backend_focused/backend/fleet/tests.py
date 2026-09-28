from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from fleet.models import Vehicle
from fleet.services import VehicleService
from offices.models import Office


class VehicleApiTests(APITestCase):
    def setUp(self):
        self.office = Office.objects.create(name="Downtown Office", city="New York")

    def vehicle_payload(self, **overrides):
        payload = {
            "vin": "1HGCM82633A004352",
            "license_plate": "ABC-1234",
            "make": "Honda",
            "model": "Accord",
            "year": 2022,
            "office": self.office.id,
            "active": True,
        }
        return payload | overrides

    def test_vehicle_crud(self):
        create_response = self.client.post(
            reverse("vehicle-list"),
            self.vehicle_payload(),
            format="json",
        )

        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        vehicle_id = create_response.data["id"]

        detail_url = reverse("vehicle-detail", args=[vehicle_id])
        detail_response = self.client.get(detail_url)
        self.assertEqual(detail_response.status_code, status.HTTP_200_OK)
        self.assertEqual(detail_response.data["office"], self.office.id)

        update_response = self.client.patch(
            detail_url,
            {"active": False},
            format="json",
        )
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)
        self.assertFalse(update_response.data["active"])

        delete_response = self.client.delete(detail_url)
        self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)

    def test_rejects_duplicate_vin(self):
        Vehicle.objects.create(
            **self.vehicle_payload(office=self.office),
        )

        response = self.client.post(
            reverse("vehicle-list"),
            self.vehicle_payload(
                vin="1hgcm82633a004352",
                license_plate="XYZ-9876",
            ),
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("vin", response.data)

    def test_rejects_duplicate_plate_between_active_vehicles(self):
        Vehicle.objects.create(
            **self.vehicle_payload(office=self.office),
        )

        response = self.client.post(
            reverse("vehicle-list"),
            self.vehicle_payload(vin="1HGCM82633A004353"),
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("license_plate", response.data)

    def test_allows_duplicate_plate_for_inactive_vehicle(self):
        Vehicle.objects.create(
            **self.vehicle_payload(office=self.office),
        )

        response = self.client.post(
            reverse("vehicle-list"),
            self.vehicle_payload(
                vin="1HGCM82633A004353",
                active=False,
            ),
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_rejects_activation_when_plate_belongs_to_active_vehicle(self):
        Vehicle.objects.create(
            **self.vehicle_payload(office=self.office),
        )
        inactive_vehicle = Vehicle.objects.create(
            **self.vehicle_payload(
                vin="1HGCM82633A004353",
                active=False,
                office=self.office,
            ),
        )

        response = self.client.patch(
            reverse("vehicle-detail", args=[inactive_vehicle.id]),
            {"active": True},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("license_plate", response.data)


class VehicleConflictServiceTests(TestCase):
    def setUp(self):
        self.service = VehicleService()
        self.office = Office.objects.create(name="Downtown Office", city="New York")
        self.vehicle = Vehicle.objects.create(
            vin="1HGCM82633A004352",
            license_plate="ABC-1234",
            make="Honda",
            model="Accord",
            year=2022,
            office=self.office,
        )

    def test_finds_vin_and_active_license_plate_conflicts(self):
        conflicts = self.service.find_conflicts(
            vin="1hgcm82633a004352",
            license_plate="abc-1234",
        )

        self.assertEqual(conflicts, ["vin", "license_plate"])

    def test_can_exclude_current_vehicle(self):
        conflicts = self.service.find_conflicts(
            vin=self.vehicle.vin,
            license_plate=self.vehicle.license_plate,
            exclude_vehicle_id=self.vehicle.id,
        )

        self.assertEqual(conflicts, [])
