from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from offices.models import Office


class VehicleApiTests(APITestCase):
    def setUp(self):
        self.office = Office.objects.create(name="Downtown Office", city="New York")

    def test_vehicle_crud(self):
        create_response = self.client.post(
            reverse("vehicle-list"),
            {
                "vin": "1HGCM82633A004352",
                "license_plate": "ABC-1234",
                "make": "Honda",
                "model": "Accord",
                "year": 2022,
                "office": self.office.id,
                "active": True,
            },
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
