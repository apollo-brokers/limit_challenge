from datetime import timedelta

from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from submissions import models


class SubmissionApiTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.owner = models.TeamMember.objects.create(
            full_name="Avery Analyst",
            email="avery@example.com",
        )

        cls.broker_one = models.Broker.objects.create(
            name="Atlas Brokerage",
            primary_contact_email="atlas@example.com",
        )
        cls.broker_two = models.Broker.objects.create(
            name="Beacon Brokerage",
            primary_contact_email="beacon@example.com",
        )

        cls.company_one = models.Company.objects.create(
            legal_name="Northwind Logistics",
            industry="Logistics",
            headquarters_city="Chicago",
        )
        cls.company_two = models.Company.objects.create(
            legal_name="Sunset Health",
            industry="Healthcare",
            headquarters_city="Denver",
        )

        cls.submission_one = models.Submission.objects.create(
            company=cls.company_one,
            broker=cls.broker_one,
            owner=cls.owner,
            status=models.Submission.Status.NEW,
            priority=models.Submission.Priority.HIGH,
            summary="Northwind expansion opportunity",
        )
        cls.submission_two = models.Submission.objects.create(
            company=cls.company_two,
            broker=cls.broker_two,
            owner=cls.owner,
            status=models.Submission.Status.CLOSED,
            priority=models.Submission.Priority.LOW,
            summary="Sunset renewal opportunity",
        )

        models.Document.objects.create(
            submission=cls.submission_one,
            title="Northwind deck",
            doc_type="Presentation",
            file_url="https://example.com/northwind-deck",
        )

        earlier_note = models.Note.objects.create(
            submission=cls.submission_one,
            author_name="Avery Analyst",
            body="Initial intake complete.",
        )
        later_note = models.Note.objects.create(
            submission=cls.submission_one,
            author_name="Jordan Reviewer",
            body="Need updated loss runs before approval.",
        )

        earlier = timezone.now() - timedelta(days=1)
        later = timezone.now()
        models.Note.objects.filter(pk=earlier_note.pk).update(created_at=earlier)
        models.Note.objects.filter(pk=later_note.pk).update(created_at=later)

    def test_brokers_endpoint_returns_plain_list(self):
        response = self.client.get(reverse("broker-list"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)
        self.assertEqual(len(response.data), 2)

    def test_submission_list_supports_broker_and_company_filters(self):
        response = self.client.get(
            reverse("submission-list"),
            {
                "brokerId": self.broker_one.id,
                "companySearch": "northwind",
            },
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["id"], self.submission_one.id)

    def test_submission_list_returns_counts_and_latest_note_preview(self):
        response = self.client.get(
            reverse("submission-list"),
            {
                "hasDocuments": "true",
                "hasNotes": "true",
            },
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)

        result = response.json()["results"][0]
        self.assertEqual(result["documentCount"], 1)
        self.assertEqual(result["noteCount"], 2)
        self.assertEqual(result["latestNote"]["authorName"], "Jordan Reviewer")
        self.assertIn("updated loss runs", result["latestNote"]["bodyPreview"])
