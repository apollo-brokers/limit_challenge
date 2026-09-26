from django.conf import settings
from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APITestCase


class ApiConfigurationContractTests(TestCase):
    def test_api_uses_jwt_authentication_by_default(self):
        self.assertEqual(
            settings.REST_FRAMEWORK.get("DEFAULT_AUTHENTICATION_CLASSES"),
            ["rest_framework_simplejwt.authentication.JWTAuthentication"],
        )

    def test_api_requires_authentication_by_default(self):
        self.assertEqual(
            settings.REST_FRAMEWORK.get("DEFAULT_PERMISSION_CLASSES"),
            ["rest_framework.permissions.IsAuthenticated"],
        )

    def test_api_uses_spectacular_schema(self):
        self.assertEqual(
            settings.REST_FRAMEWORK.get("DEFAULT_SCHEMA_CLASS"),
            "drf_spectacular.openapi.AutoSchema",
        )


class PublicApiDocumentationContractTests(APITestCase):
    def test_schema_is_publicly_accessible(self):
        response = self.client.get(
            "/api/v1/schema/",
            HTTP_ACCEPT="application/json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_docs_are_publicly_accessible(self):
        response = self.client.get("/api/v1/docs/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_schema_describes_the_fleet_maintenance_api(self):
        response = self.client.get(
            "/api/v1/schema/",
            HTTP_ACCEPT="application/json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.json()["info"],
            {
                "title": "Fleet Maintenance API",
                "description": "Manage fleet vehicles and their maintenance history.",
                "version": "1.0.0",
            },
        )

    def test_schema_defines_jwt_bearer_authentication(self):
        response = self.client.get(
            "/api/v1/schema/",
            HTTP_ACCEPT="application/json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.json()["components"]["securitySchemes"]["jwtAuth"],
            {
                "type": "http",
                "scheme": "bearer",
                "bearerFormat": "JWT",
            },
        )


class JwtAuthenticationContractTests(APITestCase):
    username = "fleet-admin"
    password = "a-secure-test-password"

    @classmethod
    def setUpTestData(cls):
        get_user_model().objects.create_user(
            username=cls.username,
            password=cls.password,
        )

    def test_valid_credentials_return_access_and_refresh_tokens(self):
        response = self.client.post(
            "/api/v1/auth/token/",
            {"username": self.username, "password": self.password},
            format="json",
            HTTP_ACCEPT="application/json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response["Content-Type"], "application/json")
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_refresh_token_returns_a_new_access_token(self):
        token_response = self.client.post(
            "/api/v1/auth/token/",
            {"username": self.username, "password": self.password},
            format="json",
            HTTP_ACCEPT="application/json",
        )
        self.assertEqual(token_response.status_code, status.HTTP_200_OK)
        self.assertEqual(token_response["Content-Type"], "application/json")

        response = self.client.post(
            "/api/v1/auth/token/refresh/",
            {"refresh": token_response.data["refresh"]},
            format="json",
            HTTP_ACCEPT="application/json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response["Content-Type"], "application/json")
        self.assertIn("access", response.data)
        self.assertNotEqual(response.data["access"], token_response.data["access"])
