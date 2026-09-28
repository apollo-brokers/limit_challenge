from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from fleet.models import Vehicle
from maintenance.models import Mechanic
from offices.models import Office


class MechanicApiTests(APITestCase):
    def test_mechanic_crud(self):
        create_response = self.client.post(
            reverse("mechanic-list"),
            {
                "name": "Jane Smith",
                "certification_number": "ASE-001",
                "active": True,
            },
            format="json",
        )

        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        mechanic_id = create_response.data["id"]

        detail_url = reverse("mechanic-detail", args=[mechanic_id])
        detail_response = self.client.get(detail_url)
        self.assertEqual(detail_response.status_code, status.HTTP_200_OK)

        update_response = self.client.patch(
            detail_url,
            {"active": False},
            format="json",
        )
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)
        self.assertFalse(update_response.data["active"])

        delete_response = self.client.delete(detail_url)
        self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)


class MaintenanceRecordApiTests(APITestCase):
    def setUp(self):
        office = Office.objects.create(name="Downtown Office", city="New York")
        self.vehicle = Vehicle.objects.create(
            vin="1HGCM82633A004352",
            license_plate="ABC-1234",
            make="Honda",
            model="Accord",
            year=2022,
            office=office,
        )
        self.mechanic = Mechanic.objects.create(
            name="Jane Smith",
            certification_number="ASE-001",
        )

    def test_maintenance_record_crud(self):
        create_response = self.client.post(
            reverse("maintenance-record-list"),
            {
                "vehicle": self.vehicle.id,
                "mechanic": self.mechanic.id,
                "maintenance_date": "2026-09-28",
                "maintenance_type": "Oil change",
                "cost": "125.50",
                "notes": "Synthetic oil",
            },
            format="json",
        )

        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        record_id = create_response.data["id"]

        detail_url = reverse("maintenance-record-detail", args=[record_id])
        detail_response = self.client.get(detail_url)
        self.assertEqual(detail_response.status_code, status.HTTP_200_OK)
        self.assertEqual(detail_response.data["vehicle"], self.vehicle.id)
        self.assertEqual(detail_response.data["mechanic"], self.mechanic.id)

        update_response = self.client.patch(
            detail_url,
            {"cost": "150.00"},
            format="json",
        )
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)
        self.assertEqual(update_response.data["cost"], "150.00")

        delete_response = self.client.delete(detail_url)
        self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)
