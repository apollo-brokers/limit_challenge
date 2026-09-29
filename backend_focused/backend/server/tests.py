from django.test import SimpleTestCase
from django.urls import reverse


class HealthCheckTests(SimpleTestCase):
    def test_returns_ok_without_accessing_the_database(self):
        response = self.client.get(reverse("health-check"))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"status": "ok"})


class ApiDocumentationTests(SimpleTestCase):
    def test_swagger_documentation_is_available(self):
        response = self.client.get(reverse("api-docs"))

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Fleet Maintenance API")

    def test_openapi_schema_is_available(self):
        response = self.client.get(
            reverse("api-schema"),
            HTTP_ACCEPT="application/vnd.oai.openapi+json",
        )

        self.assertEqual(response.status_code, 200)
        schema = response.json()
        self.assertEqual(schema["info"]["title"], "Fleet Maintenance API")
        self.assertEqual(schema["paths"]["/api/offices/"]["get"]["tags"], ["Offices"])
        self.assertEqual(
            schema["paths"]["/api/vehicles/"]["get"]["tags"],
            ["Vehicles"],
        )
        self.assertEqual(
            schema["paths"]["/api/mechanics/"]["get"]["tags"],
            ["Mechanics"],
        )
        self.assertEqual(
            schema["paths"]["/api/maintenance-records/"]["get"]["tags"],
            ["Maintenance Records"],
        )
