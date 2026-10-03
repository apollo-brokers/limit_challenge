from datetime import timedelta

from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from submissions import models


class SubmissionAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.now = timezone.now()

        self.broker_a = models.Broker.objects.create(
            name="Alpha Brokerage", primary_contact_email="alpha@example.com"
        )
        self.broker_b = models.Broker.objects.create(
            name="Beta Brokerage", primary_contact_email="beta@example.com"
        )
        self.company_acme = models.Company.objects.create(
            legal_name="Acme Corp", industry="Software", headquarters_city="Austin"
        )
        self.company_other = models.Company.objects.create(
            legal_name="Other Industries", industry="Manufacturing", headquarters_city="Dallas"
        )
        self.owner = models.TeamMember.objects.create(
            full_name="Jordan Lee", email="jordan@example.com"
        )

        self.submission_acme = models.Submission.objects.create(
            company=self.company_acme,
            broker=self.broker_a,
            owner=self.owner,
            status=models.Submission.Status.NEW,
            priority=models.Submission.Priority.HIGH,
            summary="Acme opportunity",
            created_at=self.now - timedelta(days=10),
        )
        self.submission_other = models.Submission.objects.create(
            company=self.company_other,
            broker=self.broker_b,
            owner=self.owner,
            status=models.Submission.Status.IN_REVIEW,
            priority=models.Submission.Priority.LOW,
            summary="Other opportunity",
            created_at=self.now - timedelta(days=40),
        )

        models.Contact.objects.create(
            submission=self.submission_acme,
            name="Pat Contact",
            role="CFO",
            email="pat@acme.com",
            phone="555-0100",
        )
        models.Document.objects.create(
            submission=self.submission_acme,
            title="Teaser",
            doc_type="Summary",
            file_url="https://example.com/teaser.pdf",
        )
        models.Note.objects.create(
            submission=self.submission_acme,
            author_name="Jordan Lee",
            body="Initial review note for Acme.",
            created_at=self.now - timedelta(days=9),
        )
        models.Note.objects.create(
            submission=self.submission_acme,
            author_name="Alex Reviewer",
            body="Follow-up note that should appear as the latest preview.",
            created_at=self.now - timedelta(days=1),
        )

    def test_list_includes_nested_relations_counts_and_latest_note(self):
        response = self.client.get("/api/submissions/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 2)

        # response.data is pre-render (snake_case); CamelCaseJSONRenderer applies on the wire.
        acme = next(item for item in response.data["results"] if item["id"] == self.submission_acme.id)
        self.assertEqual(acme["company"]["legal_name"], "Acme Corp")
        self.assertEqual(acme["broker"]["name"], "Alpha Brokerage")
        self.assertEqual(acme["owner"]["full_name"], "Jordan Lee")
        self.assertEqual(acme["document_count"], 1)
        self.assertEqual(acme["note_count"], 2)
        self.assertEqual(acme["latest_note"]["author_name"], "Alex Reviewer")
        self.assertIn("Follow-up note", acme["latest_note"]["body_preview"])

    def test_filter_by_status(self):
        response = self.client.get("/api/submissions/", {"status": "new"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["id"], self.submission_acme.id)

    def test_filter_by_broker_id(self):
        response = self.client.get("/api/submissions/", {"brokerId": self.broker_b.id})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["id"], self.submission_other.id)

    def test_filter_by_company_search(self):
        response = self.client.get("/api/submissions/", {"companySearch": "acme"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["id"], self.submission_acme.id)

    def test_filter_by_priority(self):
        response = self.client.get("/api/submissions/", {"priority": "low"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["id"], self.submission_other.id)

    def test_filter_by_created_date_range(self):
        created_from = (self.now - timedelta(days=15)).date().isoformat()
        created_to = self.now.date().isoformat()
        response = self.client.get(
            "/api/submissions/",
            {"createdFrom": created_from, "createdTo": created_to},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["id"], self.submission_acme.id)

    def test_detail_includes_contacts_documents_and_notes(self):
        response = self.client.get(f"/api/submissions/{self.submission_acme.id}/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["company"]["legal_name"], "Acme Corp")
        self.assertEqual(len(response.data["contacts"]), 1)
        self.assertEqual(response.data["contacts"][0]["name"], "Pat Contact")
        self.assertEqual(len(response.data["documents"]), 1)
        self.assertEqual(response.data["documents"][0]["title"], "Teaser")
        self.assertEqual(len(response.data["notes"]), 2)

    def test_brokers_endpoint_returns_unpaginated_list(self):
        response = self.client.get("/api/brokers/")
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.data, list)
        self.assertEqual(len(response.data), 2)
        names = {broker["name"] for broker in response.data}
        self.assertEqual(names, {"Alpha Brokerage", "Beta Brokerage"})
