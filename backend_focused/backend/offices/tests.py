from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase


class OfficeApiTests(APITestCase):
    def test_office_crud(self):
        create_response = self.client.post(
            reverse("office-list"),
            {"name": "Downtown Office", "city": "New York"},
            format="json",
        )

        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        office_id = create_response.data["id"]

        detail_url = reverse("office-detail", args=[office_id])
        detail_response = self.client.get(detail_url)
        self.assertEqual(detail_response.status_code, status.HTTP_200_OK)
        self.assertEqual(detail_response.data["city"], "New York")

        update_response = self.client.patch(
            detail_url,
            {"city": "Boston"},
            format="json",
        )
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)
        self.assertEqual(update_response.data["city"], "Boston")

        delete_response = self.client.delete(detail_url)
        self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)
