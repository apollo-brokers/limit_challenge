from datetime import timedelta

from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from submissions import models


class SubmissionFixtureMixin:
    def setUp(self):
        super().setUp()

        self.broker_a = models.Broker.objects.create(
            name="Alpha Brokerage", primary_contact_email="alpha@example.com"
        )
        self.broker_b = models.Broker.objects.create(
            name="Beta Brokerage", primary_contact_email="beta@example.com"
        )

        self.company_acme = models.Company.objects.create(
            legal_name="Acme Robotics", industry="Manufacturing", headquarters_city="Denver"
        )
        self.company_globex = models.Company.objects.create(
            legal_name="Globex Logistics", industry="Transportation", headquarters_city="Reno"
        )

        self.owner = models.TeamMember.objects.create(
            full_name="Jamie Rivera", email="jamie@example.com"
        )

        now = timezone.now()

        self.submission_new_acme = models.Submission.objects.create(
            company=self.company_acme,
            broker=self.broker_a,
            owner=self.owner,
            status=models.Submission.Status.NEW,
            priority=models.Submission.Priority.HIGH,
            summary="New opportunity with Acme",
            created_at=now - timedelta(days=1),
        )
        self.submission_review_globex = models.Submission.objects.create(
            company=self.company_globex,
            broker=self.broker_b,
            owner=self.owner,
            status=models.Submission.Status.IN_REVIEW,
            priority=models.Submission.Priority.MEDIUM,
            summary="Reviewing Globex logistics contract",
            created_at=now - timedelta(days=10),
        )
        self.submission_closed_acme = models.Submission.objects.create(
            company=self.company_acme,
            broker=self.broker_b,
            owner=self.owner,
            status=models.Submission.Status.CLOSED,
            priority=models.Submission.Priority.LOW,
            summary="Closed deal with Acme",
            created_at=now - timedelta(days=30),
        )

        models.Document.objects.create(
            submission=self.submission_new_acme,
            title="Acme Proposal",
            doc_type="Contract",
            file_url="https://example.com/doc.pdf",
        )
        models.Note.objects.create(
            submission=self.submission_new_acme,
            author_name="Jamie Rivera",
            body="Initial call went well.",
            created_at=now - timedelta(hours=2),
        )
        models.Note.objects.create(
            submission=self.submission_new_acme,
            author_name="Jamie Rivera",
            body="Follow-up scheduled for next week.",
            created_at=now - timedelta(hours=1),
        )
        models.Contact.objects.create(
            submission=self.submission_review_globex,
            name="Pat Lee",
            role="VP Operations",
            email="pat@globex.com",
            phone="555-0100",
        )


class SubmissionListFilterTests(SubmissionFixtureMixin, APITestCase):
    def get_ids(self, response):
        return {item["id"] for item in response.data["results"]}

    def test_list_returns_all_by_default(self):
        response = self.client.get(reverse("submission-list"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 3)

    def test_filter_by_status(self):
        response = self.client.get(reverse("submission-list"), {"status": "new"})
        self.assertEqual(self.get_ids(response), {self.submission_new_acme.id})

    def test_filter_by_broker_id(self):
        response = self.client.get(reverse("submission-list"), {"brokerId": self.broker_b.id})
        self.assertEqual(
            self.get_ids(response),
            {self.submission_review_globex.id, self.submission_closed_acme.id},
        )

    def test_filter_by_company_search_matches_name_industry_or_city(self):
        response = self.client.get(reverse("submission-list"), {"companySearch": "acme"})
        self.assertEqual(
            self.get_ids(response), {self.submission_new_acme.id, self.submission_closed_acme.id}
        )

        response = self.client.get(reverse("submission-list"), {"companySearch": "reno"})
        self.assertEqual(self.get_ids(response), {self.submission_review_globex.id})

    def test_filter_by_created_from_and_to(self):
        five_days_ago = (timezone.now() - timedelta(days=5)).date().isoformat()
        response = self.client.get(reverse("submission-list"), {"createdFrom": five_days_ago})
        self.assertEqual(self.get_ids(response), {self.submission_new_acme.id})

        response = self.client.get(reverse("submission-list"), {"createdTo": five_days_ago})
        self.assertEqual(
            self.get_ids(response),
            {self.submission_review_globex.id, self.submission_closed_acme.id},
        )

    def test_filter_has_documents(self):
        response = self.client.get(reverse("submission-list"), {"hasDocuments": "true"})
        self.assertEqual(self.get_ids(response), {self.submission_new_acme.id})

        response = self.client.get(reverse("submission-list"), {"hasDocuments": "false"})
        self.assertEqual(
            self.get_ids(response),
            {self.submission_review_globex.id, self.submission_closed_acme.id},
        )

    def test_filter_has_notes(self):
        response = self.client.get(reverse("submission-list"), {"hasNotes": "true"})
        self.assertEqual(self.get_ids(response), {self.submission_new_acme.id})

    def test_list_includes_counts_and_latest_note(self):
        response = self.client.get(reverse("submission-list"), {"status": "new"})
        payload = response.data["results"][0]
        self.assertEqual(payload["document_count"], 1)
        self.assertEqual(payload["note_count"], 2)
        self.assertEqual(
            payload["latest_note"]["body_preview"], "Follow-up scheduled for next week."
        )


class SubmissionDetailTests(SubmissionFixtureMixin, APITestCase):
    def test_detail_includes_nested_relations(self):
        response = self.client.get(
            reverse("submission-detail", args=[self.submission_review_globex.id])
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["contacts"]), 1)
        self.assertEqual(response.data["contacts"][0]["name"], "Pat Lee")
        self.assertEqual(response.data["company"]["legal_name"], "Globex Logistics")

    def test_detail_404_for_missing_submission(self):
        response = self.client.get(reverse("submission-detail", args=[999999]))
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class BrokerEndpointTests(SubmissionFixtureMixin, APITestCase):
    def test_brokers_list_is_not_paginated(self):
        response = self.client.get(reverse("broker-list"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)
        self.assertEqual(len(response.data), 2)
