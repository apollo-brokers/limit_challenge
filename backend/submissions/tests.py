from datetime import timedelta

from django.test import TestCase
from django.urls import reverse
from django.utils import timezone

from submissions import models


class SubmissionListFilterTests(TestCase):
    def setUp(self):
        self.list_url = reverse("submission-list")
        self.broker_alpha = models.Broker.objects.create(
            name="Alpha Broker",
            primary_contact_email="alpha@example.com",
        )
        self.broker_beta = models.Broker.objects.create(
            name="Beta Broker",
            primary_contact_email="beta@example.com",
        )
        self.owner = models.TeamMember.objects.create(
            full_name="Owner One",
            email="owner@example.com",
        )

        self.company_acme = models.Company.objects.create(
            legal_name="Acme Logistics",
            industry="Logistics",
            headquarters_city="Austin",
        )
        self.company_zen = models.Company.objects.create(
            legal_name="Zen Finance",
            industry="Finance",
            headquarters_city="New York",
        )

        self.submission_new = models.Submission.objects.create(
            company=self.company_acme,
            broker=self.broker_alpha,
            owner=self.owner,
            status=models.Submission.Status.NEW,
            priority=models.Submission.Priority.HIGH,
            summary="New submission",
        )
        self.submission_review = models.Submission.objects.create(
            company=self.company_zen,
            broker=self.broker_beta,
            owner=self.owner,
            status=models.Submission.Status.IN_REVIEW,
            priority=models.Submission.Priority.MEDIUM,
            summary="In review submission",
        )
        self.submission_closed = models.Submission.objects.create(
            company=self.company_acme,
            broker=self.broker_alpha,
            owner=self.owner,
            status=models.Submission.Status.CLOSED,
            priority=models.Submission.Priority.LOW,
            summary="Closed submission",
        )

        models.Document.objects.create(
            submission=self.submission_new,
            title="Deck",
            doc_type="pitch",
            file_url="https://example.com/deck.pdf",
        )
        models.Note.objects.create(
            submission=self.submission_review,
            author_name="Ops Manager",
            body="Need broker clarification.",
        )

        now = timezone.now()
        models.Submission.objects.filter(pk=self.submission_new.pk).update(created_at=now - timedelta(days=12))
        models.Submission.objects.filter(pk=self.submission_review.pk).update(created_at=now - timedelta(days=5))
        models.Submission.objects.filter(pk=self.submission_closed.pk).update(created_at=now - timedelta(days=1))

    def _result_ids(self, response):
        self.assertEqual(response.status_code, 200)
        return {item["id"] for item in response.data["results"]}

    def test_filters_by_status(self):
        response = self.client.get(self.list_url, {"status": "in_review"})
        self.assertSetEqual(self._result_ids(response), {self.submission_review.id})

    def test_filters_by_broker_id_camel_case(self):
        response = self.client.get(self.list_url, {"brokerId": self.broker_beta.id})
        self.assertSetEqual(self._result_ids(response), {self.submission_review.id})

    def test_filters_by_company_search(self):
        response = self.client.get(self.list_url, {"companySearch": "acme"})
        self.assertSetEqual(self._result_ids(response), {self.submission_new.id, self.submission_closed.id})

    def test_filters_by_created_date_range(self):
        start = (timezone.now() - timedelta(days=6)).date().isoformat()
        end = (timezone.now() - timedelta(days=1)).date().isoformat()
        response = self.client.get(self.list_url, {"createdFrom": start, "createdTo": end})
        self.assertSetEqual(self._result_ids(response), {self.submission_review.id, self.submission_closed.id})

    def test_filters_by_has_documents(self):
        with_documents = self.client.get(self.list_url, {"hasDocuments": "true"})
        without_documents = self.client.get(self.list_url, {"hasDocuments": "false"})

        self.assertSetEqual(self._result_ids(with_documents), {self.submission_new.id})
        self.assertSetEqual(
            self._result_ids(without_documents),
            {self.submission_review.id, self.submission_closed.id},
        )

    def test_filters_by_has_notes(self):
        with_notes = self.client.get(self.list_url, {"hasNotes": "true"})
        without_notes = self.client.get(self.list_url, {"hasNotes": "false"})

        self.assertSetEqual(self._result_ids(with_notes), {self.submission_review.id})
        self.assertSetEqual(
            self._result_ids(without_notes),
            {self.submission_new.id, self.submission_closed.id},
        )
